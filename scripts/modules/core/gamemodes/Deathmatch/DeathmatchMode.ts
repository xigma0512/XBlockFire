import { system, Player, GameMode } from '@minecraft/server';

import { GameModeEnum } from '../../GameModeEnum';
import { IGameMode } from '../IGameMode';
import { DeathmatchPhaseEnum } from './phases/DeathmatchPhaseEnum';
import { DeathmatchIdlePhase } from './phases/Idle';
import { DeathmatchPreStartPhase } from './phases/PreStart';
import { DeathmatchActionPhase } from './phases/Action';

import { AlliesMarker } from '../../../player/AlliesMarker';
import { MemberManager } from '../../../player/MemberManager';
import { PhaseManager } from '../../gamephase/PhaseManager';
import { DeathmatchShop } from '../../../../ui/form/shop/DeathmatchShop';
import { DeathmatchLoadout } from './DeathmatchLoadout';
import { DeathmatchConfig } from './DeathmatchConfig';
import { DeathmatchState } from './DeathmatchState';
import { FormatCode as FC } from '../../../../utils/FormatCode';

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

        if (attacker && MemberManager.getPlayerTeam(attacker) !== MemberManager.getPlayerTeam(deadPlayer)) {
            DeathmatchState.addTeamScore(MemberManager.getPlayerTeam(attacker));
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
        const canOpen = () => PhaseManager.getPhase().phaseId === DeathmatchPhaseEnum.Action;

        if (!canOpen()) {
            system.run(() => player.sendMessage(`${FC.Red}Deathmatch shop is only available during action.`));
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
