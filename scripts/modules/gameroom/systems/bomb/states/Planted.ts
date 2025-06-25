import { GameRoomManager } from "../../GameRoom";
import { BP_BombPlantedPhase } from "../../phase/bomb_plant/BombPlanted";
import { BP_RoundEndPhase } from "../../phase/bomb_plant/RoundEnd";
import { BombIdleState } from "./Idle";

import { BP_TeamEnum } from "../../phase/TeamEnum";
import { BombStateEnum } from "./BombStateEnum";
import { BP_PhaseEnum } from "../../phase/bomb_plant/PhaseEnum";

import { Broadcast } from "../../../../../utils/Broadcast";
import { FormatCode as FC } from "../../../../../utils/FormatCode";
import { progressBar } from "../../../../../utils/Utils";
import { set_variable } from "../../../../../utils/Variable";

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
    private bombTotalTime = -1;

    private beforeItemUseListener = (ev: ItemUseBeforeEvent) => { };
    private afterItemCompleteUseListener = (ev: ItemCompleteUseAfterEvent) => { };

    constructor(
        private readonly roomId: number,
        private readonly planter: Player
    ) { }

    on_entry() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        this.entity = this.planter.dimension.spawnEntity(PLANTED_C4_ENTITY_ID, this.planter.location);

        if (room.phaseManager.getPhase().phaseTag === BP_PhaseEnum.Action) {
            room.phaseManager.updatePhase(new BP_BombPlantedPhase(this.roomId));
        }
        this.bombTotalTime = room.phaseManager.getPhase().currentTick;

        this.beforeItemUseListener = world.beforeEvents.itemUse.subscribe(this.onBeforeItemUse.bind(this));
        this.afterItemCompleteUseListener = world.afterEvents.itemCompleteUse.subscribe(this.onItemCompleteUse.bind(this));

        console.warn(`[Room ${this.roomId}] Entry BombPlanted state.`);
    }

    on_running() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const phase = room.phaseManager.getPhase();
        const bar = progressBar(this.bombTotalTime, phase.currentTick, 20);
        this.entity.nameTag = `| ${bar} |`;
        
        if (phase.currentTick <= 0) explosion(this.roomId, this.entity);
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
    
    if (room.phaseManager.getPhase().phaseTag === BP_PhaseEnum.BombPlanted) {
        set_variable(`${roomId}.round_winner`, BP_TeamEnum.Defender);
        room.phaseManager.updatePhase(new BP_RoundEndPhase(roomId));
    }

    room.bombManager.updateState(new BombIdleState(roomId));
    Broadcast.message(`${FC.Yellow}Bomb has been defused by ${defuser.name}.`);
}

function explosion(roomId: number, bombEntity: Entity) {
    bombEntity.dimension.createExplosion(bombEntity.location, 20, { causesFire: false, breaksBlocks: false });
    const room = GameRoomManager.instance.getRoom(roomId);

    room.bombManager.updateState(new BombIdleState(roomId));
}