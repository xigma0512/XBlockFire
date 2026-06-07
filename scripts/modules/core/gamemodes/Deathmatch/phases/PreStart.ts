import { GameMode, InputPermissionCategory } from '@minecraft/server';

import { gameroom } from '../../../GameRoom';
import { PhaseManager } from '../../../gamephase/PhaseManager';

import { DeathmatchPhaseEnum } from './DeathmatchPhaseEnum';
import { DeathmatchActionPhase } from './Action';
import { DeathmatchSpawn } from '../DeathmatchSpawn';
import { DeathmatchLoadout } from '../DeathmatchLoadout';

import { MemberManager } from '../../../../player/MemberManager';
import { TeamEnum } from '../../../../player/TeamEnum';
import { InvincibilitySystem } from '../../../../combat/InvincibilitySystem';

import { DeathmatchActionView } from '../../../../../ui/hud/views/DeathmatchActionView';
import { Sound } from '../../../../../ui/media/Sound';

import { set_entity_dynamic_property, set_entity_native_property } from '../../../../../utils/Property';

export class DeathmatchPreStartPhase implements IPhaseHandler {
    readonly phaseId = DeathmatchPhaseEnum.PreStart;
    readonly hud: DeathmatchActionView;

    private _currentTick = 10 * 20;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new DeathmatchActionView();
    }

    on_entry() {
        for (const player of MemberManager.getPlayers()) {
            const team = MemberManager.getPlayerTeam(player);

            if (team === TeamEnum.Spectator) {
                player.setGameMode(GameMode.Spectator);
                continue;
            }

            player.teleport(DeathmatchSpawn.randomSpawn(team));
            player.setGameMode(GameMode.Adventure);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, false);
            set_entity_dynamic_property(player, 'player:is_alive', true);
            set_entity_native_property(player, 'player:can_use_item', false);
            gameroom().activeMode.applyLoadout?.(player);
            player.getComponent('health')?.resetToDefaultValue();
            player.addEffect('regeneration', 100, { amplifier: 255, showParticles: false });
            InvincibilitySystem.setInvincible(player, 100);
        }

        if (this._currentTick === 10 * 20) {
            Sound.play('START_ROUND', MemberManager.getPlayers(), {});
        }
    }

    on_running() {
        this.playCountdown(this.currentTick);
        this._currentTick--;
        this.hud.update();

        if (this.currentTick <= 0) {
            PhaseManager.updatePhase(new DeathmatchActionPhase());
        }
    }

    on_exit() {
        Sound.play('ACTION_START', MemberManager.getPlayers(), {});
    }

    private playCountdown(currentTick: number) {
        if (currentTick <= 5 * 20 && currentTick > 0 && currentTick % 20 === 0) {
            Sound.play('BUYING_COUNTDOWN_TICK', MemberManager.getPlayers(), {});
        }
    }
}
