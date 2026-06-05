import { GameMode, InputPermissionCategory, Player, PlayerLeaveAfterEvent, system, world } from '@minecraft/server';
import { MemberManager } from '../../../../player/MemberManager';
import { TeamEnum } from '../../../../player/TeamEnum';
import { gameroom } from '../../../GameRoom';
import { GameModeEnum } from '../../../GameModeEnum';
import { DeathmatchPhaseEnum } from './DeathmatchPhaseEnum';
import { PhaseManager } from '../../../gamephase/PhaseManager';
import { DeathmatchGameOverPhase } from './Gameover';
import { DeathmatchActionView } from '../../../../../ui/hud/views/DeathmatchActionView';
import { HudDriver } from '../../../../../ui/hud/drivers/HudDriver';
import { Language as L } from '../../../../../utils/Language';
import {
    set_entity_dynamic_property,
    entity_dynamic_property,
    set_entity_native_property,
} from '../../../../../utils/Property';
import { DeathmatchConfig } from '../DeathmatchConfig';
import { DeathmatchSpawn } from '../DeathmatchSpawn';
import { DeathmatchLoadout } from '../DeathmatchLoadout';
import { DeathmatchState } from '../DeathmatchState';

export class DeathmatchActionPhase implements IPhaseHandler {
    readonly phaseId = DeathmatchPhaseEnum.Action;
    readonly hud: DeathmatchActionView;

    private _currentTick = DeathmatchConfig.ACTION_TIME;
    private readonly respawnTasks = new Map<string, number>();
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

        for (const taskId of this.respawnTasks.values()) system.clearRun(taskId);
        this.respawnTasks.clear();
    }

    queueRespawn(player: Player) {
        const playerName = player.name;
        if (this.respawnTasks.has(playerName)) return;

        const taskId = system.runTimeout(() => {
            this.respawnTasks.delete(playerName);
            this.respawn(playerName);
        }, DeathmatchConfig.RESPAWN_DELAY);
        this.respawnTasks.set(playerName, taskId);
    }

    cancelRespawn(playerName: string) {
        const taskId = this.respawnTasks.get(playerName);
        if (taskId === undefined) return;

        system.clearRun(taskId);
        this.respawnTasks.delete(playerName);
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
        gameroom().activeMode.applyLoadout?.(player);
    }

    private transitions() {
        const { attacker: attackerScore, defender: defenderScore } = DeathmatchState.getScores();

        if (attackerScore >= DeathmatchConfig.WINNING_SCORE) return this.finish(TeamEnum.Attacker);
        if (defenderScore >= DeathmatchConfig.WINNING_SCORE) return this.finish(TeamEnum.Defender);

        if (this.currentTick > 0) return;
        if (attackerScore > defenderScore) return this.finish(TeamEnum.Attacker);
        if (defenderScore > attackerScore) return this.finish(TeamEnum.Defender);

        if (!DeathmatchState.isSuddenDeath()) {
            DeathmatchState.startSuddenDeath();
            HudDriver.chat(L.translate('deathmatch.sudden_death'));
        }
    }

    private finish(winner: TeamEnum.Attacker | TeamEnum.Defender) {
        DeathmatchState.setWinner(winner);
        PhaseManager.updatePhase(new DeathmatchGameOverPhase());
    }
}
