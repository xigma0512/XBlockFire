import { GameMode, Player, system } from '@minecraft/server';

import { GameModeEnum } from '../../GameModeEnum';
import { DeathmatchActionPhase } from '../../gamephase/deathmatch/Action';
import { DeathmatchPhaseEnum } from '../../gamephase/deathmatch/DeathmatchPhaseEnum';
import { DeathmatchIdlePhase } from '../../gamephase/deathmatch/Idle';
import { DeathmatchPreStartPhase } from '../../gamephase/deathmatch/PreStart';
import { IGameMode } from '../IGameMode';

import { DeathmatchShop } from '../../../../ui/form/shop/DeathmatchShop';
import { FormatCode as FC } from '../../../../utils/FormatCode';
import { AlliesMarker } from '../../../player/AlliesMarker';
import { MemberManager } from '../../../player/MemberManager';
import { TeamEnum } from '../../../player/TeamEnum';
import { PhaseManager } from '../../gamephase/PhaseManager';
import { DeathmatchConfig } from './DeathmatchConfig';
import { DeathmatchLoadout } from './DeathmatchLoadout';
import { DeathmatchState } from './DeathmatchState';

export class DeathmatchMode implements IGameMode {
    readonly modeId = GameModeEnum.Deathmatch;

    createIdlePhase(): IPhaseHandler {
        return new DeathmatchIdlePhase();
    }

    createForceStartPhase(): IPhaseHandler {
        return new DeathmatchPreStartPhase();
    }

    setupModeTasks(): number | number[] {
        const taskId = system.runInterval(() => {
            AlliesMarker.updateMark();
        }, 3);
        return taskId;
    }

    onPlayerDeath(deadPlayer: Player, attacker?: Player): void {
        deadPlayer.getComponent('inventory')?.container.clearAll();
        deadPlayer.setGameMode(GameMode.Spectator);

        if (attacker) {
            const attackerTeam = MemberManager.getPlayerTeam(attacker);
            const deadPlayerTeam = MemberManager.getPlayerTeam(deadPlayer);

            if (
                attackerTeam !== deadPlayerTeam &&
                (attackerTeam === TeamEnum.Attacker || attackerTeam === TeamEnum.Defender) &&
                (deadPlayerTeam === TeamEnum.Attacker || deadPlayerTeam === TeamEnum.Defender)
            ) {
                DeathmatchState.addTeamScore(attackerTeam);
            }
        }

        const phase = PhaseManager.getPhase();
        if (phase.phaseId === DeathmatchPhaseEnum.Action) {
            (phase as DeathmatchActionPhase).queueRespawn(deadPlayer);
        }
    }

    getShopPointLimit(attackerScore: number, defenderScore: number): number {
        return DeathmatchConfig.SHOP_POINT_LIMIT;
    }

    openShop(player: Player): void {
        const canOpen = () => {
            const phaseId = PhaseManager.getPhase().phaseId;
            return phaseId === DeathmatchPhaseEnum.PreStart || phaseId === DeathmatchPhaseEnum.Action;
        };

        if (!canOpen()) {
            system.run(() =>
                player.sendMessage(`${FC.Red}Deathmatch shop is only available before and during action.`)
            );
            return;
        }

        system.run(() => {
            DeathmatchShop.open(player, 'primary', true, canOpen);
        });
    }

    applyLoadout(player: Player): void {
        DeathmatchLoadout.apply(player);
    }
}
