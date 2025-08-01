import { world } from "@minecraft/server";

import { GamePhaseManager } from "../../gamephase/GamePhaseManager";
import { BombStateManager } from "../BombStateManager";
import { C4DroppedState } from "./Dropped";
import { C4PlantedState } from "./Planted";
import { PlantingC4Strategy } from "../strategies/PlantingC4";
import { DropStrategy } from "../strategies/Drop";

import { GameEvent } from "../../../../infrastructure/event/GameEvent";
import { gameEvents } from "../../../../infrastructure/event/EventEmitter";

import { BombStateEnum } from "../../../../declarations/enum/BombStateEnum";
import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";

export class C4IdleState implements IBombStateHandler {

    readonly stateTag = BombStateEnum.Idle;
    readonly strategies: IBombStateStrategy[];

    private afterC4PlantedCallback = (ev: GameEvent['onC4Planted']) => { };
    private afterC4DroppedCallback = (ev: GameEvent['onC4Dropped']) => { };

    constructor() {
        this.afterC4PlantedCallback = gameEvents.subscribe('onC4Planted', this.onC4Planted.bind(this));
        this.afterC4DroppedCallback = gameEvents.subscribe('onC4Dropped', this.onC4Dropped.bind(this));

        this.strategies = [
            new PlantingC4Strategy,
            new DropStrategy
        ];
    }

    on_entry() {
        removeC4Entities();
    }

    on_running() {
        return true;
    }

    on_exit() {
        gameEvents.unsubscribe('onC4Planted', this.afterC4PlantedCallback);
        gameEvents.unsubscribe('onC4Dropped', this.afterC4DroppedCallback);
    }


    private onC4Planted(ev: GameEvent['onC4Planted']) {
        const phase = GamePhaseManager.phaseHandler;
        const phaseTag = phase.phaseTag;
        if (phaseTag !== BombPlantPhaseEnum.Action && phaseTag !== BombPlantPhaseEnum.RoundEnd) return;
        
        const { source, site } = ev;
        BombStateManager.updateState(new C4PlantedState(source, site));
    }

    private onC4Dropped(ev: GameEvent['onC4Dropped']) {
        const { source, location } = ev;
        BombStateManager.updateState(new C4DroppedState(source, location));
    }

}

function removeC4Entities() {
    world.getDimension('overworld').getEntities({families: ['c4']}).forEach(c4 => c4.remove());
}