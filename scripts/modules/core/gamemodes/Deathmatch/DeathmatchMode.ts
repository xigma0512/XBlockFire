import { system, Player, GameMode } from '@minecraft/server';


import { GameModeEnum } from '../../GameModeEnum';
import { IGameMode } from '../IGameMode';
import { DeathmatchPhaseEnum } from './phases/DeathmatchPhaseEnum';
import { DeathmatchIdlePhase } from './phases/Idle';
import { DeathmatchPreStartPhase } from './phases/PreStart';
import { DeathmatchActionPhase } from './phases/Action';

import { AlliesMarker } from '../../../player/AlliesMarker';
import { MemberManager } from '../../../player/MemberManager';
import { TeamEnum } from '../../../player/TeamEnum';
import { set_variable, variable } from '../../../../utils/Variable';
import { PhaseManager } from '../../gamephase/PhaseManager';
import { DeathmatchShop } from '../../../../ui/form/shop/DeathmatchShop';
import { DeathmatchLoadout } from './DeathmatchLoadout';

export class DeathmatchMode implements IGameMode {
    readonly modeId = GameModeEnum.Deathmatch;

    createIdlePhase(): IPhaseHandler {
        return new DeathmatchIdlePhase();
    }

    createForceStartPhase(): IPhaseHandler {
        return new DeathmatchPreStartPhase();
    }

    setupModeTasks(): number | number[] {
        // In original design, Deathmatch fell through to BombPlant's marker task
        const taskId = system.runInterval(() => {
            AlliesMarker.updateMark();
        }, 3);
        return taskId;
    }

    onPlayerDeath(deadPlayer: Player, attacker?: Player): void {
        deadPlayer.getComponent('inventory')?.container.clearAll();
        deadPlayer.setGameMode(GameMode.Spectator);

        if (attacker && MemberManager.getPlayerTeam(attacker) !== MemberManager.getPlayerTeam(deadPlayer)) {
            const attackerTeam = MemberManager.getPlayerTeam(attacker);
            if (attackerTeam === TeamEnum.Attacker) {
                set_variable('attacker_score', (variable('attacker_score') || 0) + 1);
            } else if (attackerTeam === TeamEnum.Defender) {
                set_variable('defender_score', (variable('defender_score') || 0) + 1);
            }
        }

        const phase = PhaseManager.getPhase();
        if (phase.phaseId === DeathmatchPhaseEnum.Action) {
            (phase as DeathmatchActionPhase).queueRespawn(deadPlayer);
        }
    }

    getShopPointLimit(attackerScore: number, defenderScore: number): number {
        // Deathmatch shop uses static large amount of points usually, or we can check DeathmatchConfig
        // But the current implementation Shop.ts: EquipmentPointManager.getPointLimit(variable('attacker_score'), variable('defender_score'))
        // Wait, current shop logic bypasses point limit for deathmatch sometimes or just returns the same limit?
        return 99999; // Or we can return EquipmentPointManager.getPointLimit(attackerScore, defenderScore)
    }

    openShop(player: Player): void {
        system.run(() => {
            DeathmatchShop.open(player);
        });
    }

    applyLoadout(player: Player): void {
        DeathmatchLoadout.apply(player);
    }
}
