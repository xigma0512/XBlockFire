import { GameMode, InputPermissionCategory, Player, PlayerLeaveAfterEvent, system, world } from '@minecraft/server';

import { gameroom } from '../../../GameRoom';
import { GameModeEnum } from '../../../GameModeEnum';
import { PhaseManager } from '../../../gamephase/PhaseManager';

import { DeathmatchPhaseEnum } from './DeathmatchPhaseEnum';
import { DeathmatchGameOverPhase } from './Gameover';
import { DeathmatchConfig } from '../DeathmatchConfig';
import { DeathmatchState } from '../DeathmatchState';
import { DeathmatchSpawn } from '../DeathmatchSpawn';
import { DeathmatchLoadout } from '../DeathmatchLoadout';

import { MemberManager } from '../../../../player/MemberManager';
import { TeamEnum } from '../../../../player/TeamEnum';
import { InvincibilitySystem } from '../../../../combat/InvincibilitySystem';

import { DeathmatchActionView } from '../../../../../ui/hud/views/DeathmatchActionView';
import { HudDriver } from '../../../../../ui/hud/drivers/HudDriver';

import { Language as L } from '../../../../../utils/Language';
import { Sound } from '../../../../../ui/media/Sound';
import { FormatCode as FC } from '../../../../../utils/FormatCode';
import {
    set_entity_dynamic_property,
    entity_dynamic_property,
    set_entity_native_property,
} from '../../../../../utils/Property';

interface RespawnTask {
    countdownTaskId: number;
    respawnTaskId: number;
}

const SUDDEN_DEATH_START_SOUND_ID = 'mob.wither.spawn';

export class DeathmatchActionPhase implements IPhaseHandler {
    readonly phaseId = DeathmatchPhaseEnum.Action;
    readonly hud: DeathmatchActionView;

    private _currentTick = DeathmatchConfig.ACTION_TIME;
    private readonly respawnTasks = new Map<string, RespawnTask>();
    private readonly clearShopItemTasks = new Map<string, number>();
    private throwableRestockTaskId?: number;
    private playerLeaveListener?: (ev: PlayerLeaveAfterEvent) => void;

    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new DeathmatchActionView();
    }

    on_entry() {
        this._currentTick = DeathmatchConfig.ACTION_TIME;
        this.playerLeaveListener = world.afterEvents.playerLeave.subscribe((ev) => {
            this.cancelRespawn(ev.playerName);
        });
        this.throwableRestockTaskId = system.runInterval(() => {
            for (const player of MemberManager.getPlayers()) {
                if (!player.isValid) continue;
                if (!entity_dynamic_property(player, 'player:is_alive')) continue;

                DeathmatchLoadout.restockThrowables(player);
            }
        }, DeathmatchConfig.THROWABLE_RESTOCK_INTERVAL);

        for (const player of MemberManager.getPlayers()) {
            if (entity_dynamic_property(player, 'player:is_alive')) {
                player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, true);
                set_entity_native_property(player, 'player:can_use_item', true);

                const clearShopItemTask = system.runTimeout(() => {
                    this.clearShopItemTasks.delete(player.name);
                    const p = world.getPlayers().find((p) => p.name === player.name);
                    if (p && p.isValid) {
                        DeathmatchLoadout.clearShopItem(p);
                    }
                }, 200);
                this.clearShopItemTasks.set(player.name, clearShopItemTask);
            }
        }
    }

    on_running() {
        if (!DeathmatchState.isSuddenDeath()) this._currentTick--;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        if (this.playerLeaveListener) {
            world.afterEvents.playerLeave.unsubscribe(this.playerLeaveListener);
            this.playerLeaveListener = undefined;
        }

        for (const task of this.respawnTasks.values()) this.clearRespawnTask(task);
        this.respawnTasks.clear();

        for (const taskId of this.clearShopItemTasks.values()) system.clearRun(taskId);
        this.clearShopItemTasks.clear();

        if (this.throwableRestockTaskId !== undefined) {
            system.clearRun(this.throwableRestockTaskId);
            this.throwableRestockTaskId = undefined;
        }
    }

    queueRespawn(player: Player) {
        const playerName = player.name;
        if (this.respawnTasks.has(playerName)) return;

        const startTick = system.currentTick;
        this.showRespawnCountdown(player, DeathmatchConfig.RESPAWN_DELAY);

        const countdownTaskId = system.runInterval(() => {
            const p = world.getPlayers().find((p) => p.name === playerName);
            if (!p || !p.isValid) return;

            const remainingTicks = DeathmatchConfig.RESPAWN_DELAY - (system.currentTick - startTick);
            if (remainingTicks <= 0) return;

            this.showRespawnCountdown(p, remainingTicks);
        }, 20);

        const respawnTaskId = system.runTimeout(() => {
            const task = this.respawnTasks.get(playerName);
            if (task) this.clearRespawnCountdown(task);
            this.respawnTasks.delete(playerName);
            this.respawn(playerName);
        }, DeathmatchConfig.RESPAWN_DELAY);

        this.respawnTasks.set(playerName, { countdownTaskId, respawnTaskId });
    }

    cancelRespawn(playerName: string) {
        const task = this.respawnTasks.get(playerName);
        if (task === undefined) return;

        this.clearRespawnTask(task);
        this.respawnTasks.delete(playerName);
    }

    private clearRespawnTask(task: RespawnTask) {
        this.clearRespawnCountdown(task);
        system.clearRun(task.respawnTaskId);
    }

    private clearRespawnCountdown(task: RespawnTask) {
        system.clearRun(task.countdownTaskId);
    }

    private showRespawnCountdown(player: Player, remainingTicks: number) {
        const remainingSeconds = Math.max(1, Math.ceil(remainingTicks / 20));
        HudDriver.pushActionbar(
            player,
            L.translate('deathmatch.respawn_in', remainingSeconds),
            20,
            'deathmatch_respawn'
        );
    }

    private respawn(playerName: string) {
        const player = world.getPlayers().find((p) => p.name === playerName);
        if (!player) return;
        if (!player.isValid) return;
        if (gameroom().gameMode !== GameModeEnum.Deathmatch) return;
        if (PhaseManager.getPhase() !== this) return;
        if (!MemberManager.includePlayer(player)) return;
        if (entity_dynamic_property(player, 'player:is_alive')) return;

        const team = MemberManager.getPlayerTeam(player);
        if (team !== TeamEnum.Attacker && team !== TeamEnum.Defender) return;

        player.teleport(DeathmatchSpawn.randomSpawn(team));
        player.setGameMode(GameMode.Adventure);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, true);
        set_entity_dynamic_property(player, 'player:is_alive', true);
        set_entity_native_property(player, 'player:can_use_item', true);
        player.addEffect('regeneration', 40, { amplifier: 255, showParticles: false });
        player.addEffect('saturation', 20, { amplifier: 5, showParticles: false });
        InvincibilitySystem.setInvincible(player, 100);

        player.getComponent('health')?.resetToDefaultValue();

        gameroom().activeMode.applyLoadout?.(player);

        const clearShopItemTask = system.runTimeout(() => {
            this.clearShopItemTasks.delete(playerName);
            const p = world.getPlayers().find((p) => p.name === playerName);
            if (p && p.isValid) {
                DeathmatchLoadout.clearShopItem(p);
            }
        }, 200);
        this.clearShopItemTasks.set(playerName, clearShopItemTask);
    }

    private transitions() {
        const { attacker: attackerScore, defender: defenderScore } = DeathmatchState.getScores();

        const attackerCount = MemberManager.getPlayers({ team: TeamEnum.Attacker }).length;
        const defenderCount = MemberManager.getPlayers({ team: TeamEnum.Defender }).length;

        if (attackerCount === 0) return this.finish(TeamEnum.Defender);
        if (defenderCount === 0) return this.finish(TeamEnum.Attacker);

        if (attackerScore >= DeathmatchConfig.WINNING_SCORE) return this.finish(TeamEnum.Attacker);
        if (defenderScore >= DeathmatchConfig.WINNING_SCORE) return this.finish(TeamEnum.Defender);

        if (this.currentTick > 0) return;
        if (attackerScore > defenderScore) return this.finish(TeamEnum.Attacker);
        if (defenderScore > attackerScore) return this.finish(TeamEnum.Defender);

        if (!DeathmatchState.isSuddenDeath()) {
            DeathmatchState.startSuddenDeath();
            Sound.playTo(SUDDEN_DEATH_START_SOUND_ID);
            HudDriver.chat(FC.Red + L.translate('deathmatch.sudden_death'));
        }
    }

    private finish(winner: TeamEnum.Attacker | TeamEnum.Defender) {
        DeathmatchState.setWinner(winner);
        PhaseManager.updatePhase(new DeathmatchGameOverPhase());
    }
}
