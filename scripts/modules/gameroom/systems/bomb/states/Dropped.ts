import { BombStateEnum } from "./BombStateEnum";
import { BombIdleState } from "./Idle";
import { GameRoomManager } from "../../GameRoom";

import { TeamEnum } from "../../../types/TeamEnum";

import { entity_dynamic_property } from "../../../../../utils/Property";
import { FormatCode as FC } from "../../../../../utils/FormatCode";
import { Broadcast } from "../../../../../utils/Broadcast";

import { Entity, ItemStack, Player, world } from "@minecraft/server";
import { EntityHitEntityAfterEvent } from "@minecraft/server";
import { VanillaEntityIdentifier, Dimension, Vector3 } from "@minecraft/server";

const DROPPED_C4_ENTITY_ID = 'xblockfire:dropped_c4' as VanillaEntityIdentifier;
const C4_ITEM_ID = 'xblockfire:c4';
const ROTATION_SPEED = 7.5;

export class BombDroppedState implements IBombStateHandler {

    readonly stateTag = BombStateEnum.Dropped;

    private entity!: Entity;

    private afterEntityHitEntityListener: (ev: EntityHitEntityAfterEvent) => void;

    constructor(
        private readonly roomId: number, 
        private dimension: Dimension,
        private location: Vector3
    ) {
        this.dimension = dimension;
        this.location = location;

        this.afterEntityHitEntityListener = this.onEntityHit.bind(this);
    }

    on_entry() {
        this.entity = this.dimension.spawnEntity(DROPPED_C4_ENTITY_ID, this.location);
        world.afterEvents.entityHitEntity.subscribe(this.afterEntityHitEntityListener);
        
        console.warn(`[Room ${this.roomId}] Entry BombDropped state.`);
    }
    
    on_running() {
        if (!this.entity.isValid) {
            const room = GameRoomManager.instance.getRoom(this.roomId);
            room.bombManager.updateState(new BombIdleState(this.roomId));
            return;
        }

        const rotation = this.entity.getRotation();
        rotation.y = (rotation.y + ROTATION_SPEED) % 360;
        this.entity.setRotation(rotation);
    }
    
    on_exit() {
        world.afterEvents.entityHitEntity.unsubscribe(this.afterEntityHitEntityListener);

        this.entity.remove();

        console.warn(`[Room ${this.roomId}] Exit BombDropped state.`);
    }


    private onEntityHit(ev: EntityHitEntityAfterEvent) {
        if (ev.hitEntity.id !== this.entity.id) return;
        
        const player = ev.damagingEntity;
        if (!(player instanceof Player)) return;

        this.attemptToPickup(player);
    }


    private attemptToPickup(player: Player) {
        const playerTeam = entity_dynamic_property(player, 'player:team');
        if (playerTeam !== TeamEnum.Attacker) return;

        const inventory = player.getComponent('inventory')?.container;
        if (!inventory) return;

        inventory.addItem(new ItemStack(C4_ITEM_ID));
        
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const attackers = room.memberManager.getPlayers({ team: TeamEnum.Attacker });
        
        player.sendMessage(`${FC.Green}You pick up the bomb.`);
        Broadcast.message(`${FC.Yellow}Player ${player.name} has picked up the bomb.`, attackers);

        room.bombManager.updateState(new BombIdleState(this.roomId));
    }
}