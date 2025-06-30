import { GameRoomManager } from "../../gameroom/GameRoom";
import { BombPlantedPhase } from "../../gamephase/bomb_plant/BombPlanted";
import { RoundEndPhase } from "../../gamephase/bomb_plant/RoundEnd";
import { BombIdleState } from "./Idle";

import { TeamEnum } from "../../../types/TeamEnum";
import { BombStateEnum } from "../../../types/bombstate/BombStateEnum";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";

import { Broadcast } from "../../../utils/Broadcast";
import { FormatCode as FC } from "../../../utils/FormatCode";
import { progressBar } from "../../../utils/others/Format";
import { set_variable } from "../../../utils/Variable";
import { Config as BP_Config } from "../../gamephase/bomb_plant/_config";

import { Vector3Utils } from "@minecraft/math";
import { Entity, Player, system, world } from "@minecraft/server";
import { VanillaEntityIdentifier } from "@minecraft/server";
import { ItemUseBeforeEvent, ItemCompleteUseAfterEvent } from "@minecraft/server"

const DEFUSER_ITEM_ID = 'xblockfire:defuser';
const PLANTED_C4_ENTITY_ID = 'xblockfire:planted_c4' as VanillaEntityIdentifier;
const DEFUSE_RANGE = 1.5;

export class BombPlantedState implements IBombStateHandler {

    readonly stateTag = BombStateEnum.Planted;
    
    private entity!: Entity;
    private currentTick: number = -1;

    private beforeItemUseListener = (ev: ItemUseBeforeEvent) => { };
    private afterItemCompleteUseListener = (ev: ItemCompleteUseAfterEvent) => { };

    constructor(
        private readonly roomId: number,
        private readonly planter: Player
    ) { }

    on_entry() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        this.entity = this.planter.dimension.spawnEntity(PLANTED_C4_ENTITY_ID, this.planter.location);
        this.currentTick = BP_Config.bombplanted.COUNTDOWN_TIME;

        if (room.phaseManager.getPhase().phaseTag === BombPlantPhaseEnum.Action) {
            room.phaseManager.updatePhase(new BombPlantedPhase(this.roomId));
        }

        this.beforeItemUseListener = world.beforeEvents.itemUse.subscribe(this.onBeforeItemUse.bind(this));
        this.afterItemCompleteUseListener = world.afterEvents.itemCompleteUse.subscribe(this.onItemCompleteUse.bind(this));

        console.warn(`[Room ${this.roomId}] Entry BombPlanted state.`);
    }

    on_running() {
        const bar = progressBar(BP_Config.bombplanted.COUNTDOWN_TIME, this.currentTick, 20);
        this.entity.nameTag = `| ${bar} |`;
        this.currentTick --;

        if (this.currentTick <= 0) explosion(this.roomId, this.entity);
    }

    on_exit() {
        world.beforeEvents.itemUse.unsubscribe(this.beforeItemUseListener);
        world.afterEvents.itemCompleteUse.unsubscribe(this.afterItemCompleteUseListener);

        this.entity.remove();

        console.warn(`[Room ${this.roomId}] Exit BombPlanted state.`);
    }


    private onBeforeItemUse(ev: ItemUseBeforeEvent) {
        if (ev.itemStack.typeId !== DEFUSER_ITEM_ID) return;
        
        const player = ev.source;
        const room = GameRoomManager.instance.getRoom(this.roomId);
        if (!room.memberManager.includePlayer(player)) return;
        
        ev.cancel = !canDefuseBomb(this.entity, player);
    }
    
    private onItemCompleteUse(ev: ItemCompleteUseAfterEvent) {
        if (ev.itemStack.typeId !== DEFUSER_ITEM_ID) return;
        
        const player = ev.source;
        const room = GameRoomManager.instance.getRoom(this.roomId);
        if (!room.memberManager.includePlayer(player)) return;

        defuseComplete(this.roomId, player);
    }

}

function canDefuseBomb(bombEntity: Entity, player: Player) {
    const distance = Vector3Utils.distance(player.location, bombEntity.location);
    if (distance > DEFUSE_RANGE) {
        system.run(() => player.onScreenDisplay.setActionBar(`${FC.Red}There is no c4 in the range.`));
        return false;
    }
    system.run(() => player.onScreenDisplay.setActionBar(`Defusing...`));
    return true;
}

function defuseComplete(roomId: number, defuser: Player) {
    const room = GameRoomManager.instance.getRoom(roomId);
    
    if (room.phaseManager.getPhase().phaseTag === BombPlantPhaseEnum.BombPlanted) {
        set_variable(`${roomId}.round_winner`, TeamEnum.Defender);
        room.phaseManager.updatePhase(new RoundEndPhase(roomId));
    }

    room.bombManager.updateState(new BombIdleState(roomId));
    Broadcast.message(`${FC.Yellow}Bomb has been defused by ${defuser.name}.`);
}

function explosion(roomId: number, bombEntity: Entity) {
    bombEntity.dimension.createExplosion(bombEntity.location, 20, { causesFire: false, breaksBlocks: false });
    const room = GameRoomManager.instance.getRoom(roomId);

    room.bombManager.updateState(new BombIdleState(roomId));
}