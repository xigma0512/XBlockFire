import { GameRoomManager } from "../../GameRoom";
import { MapRegister } from "../../map/MapRegister";
import { BombPlantedState } from "./Planted";
import { BombDroppedState } from "./Dropped";

import { TeamEnum } from "../../../types/TeamEnum";
import { BombStateEnum } from "./BombStateEnum";
import { entity_dynamic_property } from "../../../../../utils/Property";
import { FormatCode as FC } from "../../../../../utils/FormatCode";

import { Vector3Utils } from "@minecraft/math";
import { Player, system, world } from "@minecraft/server";
import { EntitySpawnAfterEvent, ItemUseBeforeEvent, ItemCompleteUseAfterEvent } from "@minecraft/server";

const BOMB_TARGET_RANGE = 3;
const C4_ITEM_ID = 'xblockfire:c4';

export class BombIdleState implements IBombStateHandler {

    readonly stateTag = BombStateEnum.Idle;

    private beforeItemUseListener = (ev: ItemUseBeforeEvent) => { };
    private afterItemCompleteUseListener = (ev: ItemCompleteUseAfterEvent) => { };
    private afterEntitySpawnListener = (ev: EntitySpawnAfterEvent) => { };

    constructor(private readonly roomId: number) { }

    on_entry() {
        this.beforeItemUseListener = world.beforeEvents.itemUse.subscribe(this.onBeforeItemUse.bind(this));
        this.afterItemCompleteUseListener = world.afterEvents.itemCompleteUse.subscribe(this.onItemCompleteUse.bind(this));
        this.afterEntitySpawnListener = world.afterEvents.entitySpawn.subscribe(this.onEntitySpawn.bind(this));

        console.warn(`[Room ${this.roomId}] Entry BombIdle state.`);
    }

    on_running() { }

    on_exit() {
        world.beforeEvents.itemUse.unsubscribe(this.beforeItemUseListener);
        world.afterEvents.itemCompleteUse.unsubscribe(this.afterItemCompleteUseListener);
        world.afterEvents.entitySpawn.unsubscribe(this.afterEntitySpawnListener);

        console.warn(`[Room ${this.roomId}] Exit BombIdle state.`);
    }


    private onBeforeItemUse(ev: ItemUseBeforeEvent) {
        if (ev.itemStack.typeId !== C4_ITEM_ID) return;

        const room = GameRoomManager.instance.getRoom(this.roomId);
        if (!room.memberManager.includePlayer(ev.source)) return;

        ev.cancel = !canPlantBomb(this.roomId, ev.source);
    }

    private onItemCompleteUse(ev: ItemCompleteUseAfterEvent) {
        if (ev.itemStack.typeId !== C4_ITEM_ID) return;

        const room = GameRoomManager.instance.getRoom(this.roomId);
        if (!room.memberManager.includePlayer(ev.source)) return; 

        room.bombManager.updateState(new BombPlantedState(this.roomId, ev.source));
    }

    private onEntitySpawn(ev: EntitySpawnAfterEvent) {
        const entity = ev.entity;
        if (!entity.isValid || !entity.hasComponent('item')) return;

        const itemComp = entity.getComponent('item')!;
        if (itemComp.itemStack.typeId !== C4_ITEM_ID) return;

        const room = GameRoomManager.instance.getRoom(this.roomId);
        const player = entity.dimension
            .getEntities({ location: entity.location, maxDistance: 2, type: 'minecraft:player' })
            .find(p => room.memberManager.includePlayer(p as Player));
        
        if (!player || !(player instanceof Player)) {
            entity.remove();
            throw Error(`C4 item entity spawned at {${entity.location.x}, ${entity.location.y}, ${entity.location.z}} but no owning player found in room ${this.roomId}.`);
        }

        room.bombManager.updateState(new BombDroppedState(this.roomId, entity.dimension, entity.location));

        entity.remove();
    }

}

function canPlantBomb(roomId: number, source: Player) {
    try {
        const room = GameRoomManager.instance.getRoom(roomId);
        const sourceTeam = entity_dynamic_property(source, 'player:team');
        if (sourceTeam !== TeamEnum.Attacker) {
            throw new Error(`You are not at Attacker team.`);
        }

        const mapInfo = MapRegister.instance.getMap(room.gameMapId);
        const isAtTarget = mapInfo.positions.bomb_targets.some(target => {
            const distance = Vector3Utils.distance(source.location, target);
            return distance <= BOMB_TARGET_RANGE;
        });

        if (!isAtTarget) {
            throw new Error('Cannot plant c4 outside the bomb target position');
        }

        system.run(() => source.onScreenDisplay.setActionBar('Planting...'));
        return true;
    } catch (err: any) {
        system.run(() => source.onScreenDisplay.setActionBar(`${FC.Red}${err.message}`));
        return false;
    }
}