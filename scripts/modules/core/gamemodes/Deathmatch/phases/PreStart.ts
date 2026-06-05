import { GameMode, InputPermissionCategory } from '@minecraft/server';
import { MemberManager } from '../../../../player/MemberManager';
import { TeamEnum } from '../../../../player/TeamEnum';
import { PhaseManager } from '../../../gamephase/PhaseManager';
import { DeathmatchActionPhase } from './Action';
import { PhaseIdentity } from '../../../gamephase/PhaseIdentity';
import { InGameHud } from '../../../../../ui/InGameHud';
import { set_entity_dynamic_property, set_entity_native_property } from '../../../../../utils/Property';
import { DeathmatchSpawn } from '../DeathmatchSpawn';
import { DeathmatchLoadout } from '../DeathmatchLoadout';

export class DeathmatchPreStartPhase implements IPhaseHandler {
    readonly phaseTag = 101;
    readonly phaseId = PhaseIdentity.Deathmatch.PreStart;
    readonly hud!: InGameHud;
    readonly currentTick = -1;

    on_entry() {
        for (const player of MemberManager.getPlayers()) {
            const team = MemberManager.getPlayerTeam(player);

            if (team === TeamEnum.Spectator) {
                player.setGameMode(GameMode.Spectator);
                continue;
            }

            player.teleport(DeathmatchSpawn.randomSpawn(team));
            player.setGameMode(GameMode.Adventure);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, true);
            set_entity_dynamic_property(player, 'player:is_alive', true);
            set_entity_native_property(player, 'player:can_use_item', true);
            player.addEffect('regeneration', 40, { amplifier: 255, showParticles: false });
            player.addEffect('saturation', 20, { amplifier: 5, showParticles: false });
            DeathmatchLoadout.apply(player);
        }
    }

    on_running() {
        PhaseManager.updatePhase(new DeathmatchActionPhase());
    }

    on_exit() {}
}

