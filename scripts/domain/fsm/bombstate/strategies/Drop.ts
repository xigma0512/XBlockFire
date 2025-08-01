import { EntitySpawnAfterEvent, Player, world } from "@minecraft/server"

import { gameEvents } from "../../../../infrastructure/event/EventEmitter";

const C4_ITEM_ID = 'xblockfire:c4';

export class DropStrategy implements IBombStateStrategy {
    
    private afterEntitySpawnCallback = (ev: EntitySpawnAfterEvent) => { };
    
    initialize() {
        this.afterEntitySpawnCallback = world.afterEvents.entitySpawn.subscribe(this.onEntitySpawn);    
    }

    dispose() {
        world.afterEvents.entitySpawn.unsubscribe(this.afterEntitySpawnCallback);
    }

    private onEntitySpawn(ev: EntitySpawnAfterEvent) {
        const entity = ev.entity;
        if (!entity.isValid || !entity.hasComponent('item')) return;

        const itemComp = entity.getComponent('item')!;
        if (itemComp.itemStack.typeId !== C4_ITEM_ID) return;

        const entitiesNearby = entity.dimension.getEntities({ 
            location: entity.location,
            maxDistance: 2, 
            type: 'minecraft:player' 
        });

        const source = entitiesNearby[0];
        if (source === undefined || !(source instanceof Player)) {
            entity.remove();
            throw Error(`C4 drop without player at ${entity.location}`);
        }

        gameEvents.emit('onC4Dropped', { source, location: entity.location })
        entity.remove();
    }

}