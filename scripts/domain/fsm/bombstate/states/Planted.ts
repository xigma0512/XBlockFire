import { Player, VanillaEntityIdentifier } from "@minecraft/server";
import { Vector3Utils } from "@minecraft/math";

import { BombStateManager } from "../BombStateManager";
import { C4DefusedState } from "./Defused";
import { PlantedC4SuccessStrategy } from "../strategies/PlantedC4Success";
import { DefusingC4Strategy } from "../strategies/DefusingC4";
import { ExplosionStrategy } from "../strategies/Explosion";

import { progressBar } from "../../../../infrastructure/utils/Format";
import { GameEvent } from "../../../../infrastructure/event/GameEvent";
import { gameEvents } from "../../../../infrastructure/event/EventEmitter";

import { BombStateEnum } from "../../../../declarations/enum/BombStateEnum";

import { BombPlant as Config } from "../../../../settings/config";

export class C4PlantedState implements IBombStateHandler {

    readonly stateTag = BombStateEnum.Planted;
    readonly strategies: IBombStateStrategy[];

    private afterC4DefusedCallback = (ev: GameEvent['onC4Defused']) => { };

    constructor(private source: Player, private site: number) { 
        this.afterC4DefusedCallback = gameEvents.subscribe('onC4Defused', this.onC4Defused.bind(this));
        this.strategies = [
            new PlantedC4SuccessStrategy(source, site),
            new DefusingC4Strategy,
            new ExplosionStrategy
        ];
    }

    on_entry() {
        BombStateManager.currentTick = Config.phaseTime.c4planted;
        spawnC4Entity(this.source);
    }
    
    on_running() {
        playC4Effect();
        return true;
    }

    on_exit() {
        gameEvents.unsubscribe('onC4Defused', this.afterC4DefusedCallback);
    }


    private onC4Defused(ev: GameEvent['onC4Defused']) {
        const {source} = ev;
        BombStateManager.updateState(new C4DefusedState(source));
    }

}

function spawnC4Entity(source: Player) {
    const {dimension, location} = source;
    const entity = dimension.spawnEntity('xblockfire:planted_c4' as VanillaEntityIdentifier, location);
    BombStateManager.c4Entity = entity;
}

let soundPlayInterval = 20;
function playC4Effect() {
    const currentTick = BombStateManager.currentTick;
    const c4Entity = BombStateManager.c4Entity!;

    const totalTime = Config.phaseTime.c4planted;

    const bar = progressBar(totalTime, currentTick, 30);
    c4Entity.nameTag = `| ${bar} |`;

    if (currentTick > totalTime * (1/2)) soundPlayInterval = 20;
    else if (currentTick > totalTime * (1/3)) soundPlayInterval = 10;
    else if (currentTick > totalTime * (1/6)) soundPlayInterval = 5;
    else soundPlayInterval = 3;

    const location = Vector3Utils.add(c4Entity.location, { y: 0.3 });
    const dimension = c4Entity.dimension;

    if (currentTick % soundPlayInterval === 0) {
        dimension.playSound("xblockfire.c4_beep", location, { volume: 5 });
        try { dimension.spawnParticle("minecraft:explosion_particle", location); } catch { }
    }
}