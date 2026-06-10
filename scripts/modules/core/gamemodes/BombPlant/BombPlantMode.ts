import { Vector3Utils } from '@minecraft/math';
import { GameMode, ItemStack, Player, system } from '@minecraft/server';
import { Shop } from '../../../../ui/form/shop/BombPlantShop';
import { FormatCode as FC } from '../../../../utils/FormatCode';
import { Language as L } from '../../../../utils/Language';
import { AlliesMarker } from '../../../player/AlliesMarker';
import { MemberManager } from '../../../player/MemberManager';
import { TeamEnum } from '../../../player/TeamEnum';
import { GameModeEnum } from '../../GameModeEnum';
import { LoadoutManager } from '../../LoadoutManager';
import { C4Manager } from '../../c4state/C4Manager';
import { C4StateEnum } from '../../c4state/C4StateEnum';
import { C4DroppedState } from '../../c4state/states/Dropped';
import { PhaseManager } from '../../gamephase/PhaseManager';
import { PhaseEnum as BombPlantPhaseEnum } from '../../gamephase/bombplant/BombPlantPhaseEnum';
import { IdlePhase } from '../../gamephase/bombplant/Idle';
import { PreRoundStartPhase } from '../../gamephase/bombplant/PreRoundStart';
import { IGameMode } from '../IGameMode';
import { EquipmentPointManager } from './EquipmentPointManager';

export class BombPlantMode implements IGameMode {
    readonly modeId = GameModeEnum.BombPlant;

    createIdlePhase(): IPhaseHandler {
        return new IdlePhase();
    }

    createForceStartPhase(): IPhaseHandler {
        return new PreRoundStartPhase();
    }

    setupModeTasks(): number | number[] {
        const taskId = system.runInterval(() => {
            AlliesMarker.updateMark();
        }, 3);
        return taskId;
    }

    onPlayerDeath(deadPlayer: Player, attacker?: Player): void {
        this.dropC4(deadPlayer);
        deadPlayer.getComponent('inventory')?.container.clearAll();
        deadPlayer.setGameMode(GameMode.Spectator);
    }

    private dropC4(player: Player) {
        const container = player.getComponent('inventory')!.container!;
        if (container.find(new ItemStack('xblockfire:c4')) === undefined) return;
        C4Manager.updateState(new C4DroppedState(player.location));
    }

    getShopPointLimit(attackerScore: number, defenderScore: number): number {
        return EquipmentPointManager.getPointLimit(attackerScore, defenderScore);
    }

    onAlliesMarkerUpdate(viewer: Player, groupPlayers: Player[]): void {
        const team = MemberManager.getPlayerTeam(viewer);
        if (team === TeamEnum.Attacker) {
            const c4state = C4Manager.getHandler();
            if (c4state.stateTag === C4StateEnum.Dropped && c4state.entity) {
                const targetLoc = Vector3Utils.add(c4state.entity.location, { y: 2.3 });
                const transform = AlliesMarker.getMarkerTransform(viewer, targetLoc);
                if (transform) {
                    const varMap = AlliesMarker.getVarMap(transform.size, {
                        red: 0,
                        green: 0,
                        blue: 1,
                        alpha: 1,
                    });
                    viewer.spawnParticle('xblockfire:allies_mark', transform.location, varMap);
                }
            }
        }
    }

    openShop(player: Player): void {
        const phase = PhaseManager.getPhase();
        if (phase.phaseId !== BombPlantPhaseEnum.Buying) {
            system.run(() => player.sendMessage(FC.Red + L.translate('shop.error.not_buying')));
            return;
        }

        system.run(() => {
            Shop.openShop(player);
        });
    }

    applyLoadout(player: Player): void {
        LoadoutManager.applyCurrentHotbar(player);
    }
}
