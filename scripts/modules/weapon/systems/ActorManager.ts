import { entity_dynamic_property, set_entity_dynamic_property } from "../../../utils/Property";
import { ActorType } from "../actors/Actor";

import { system, world } from "@minecraft/server";
import { Entity, ItemStack } from "@minecraft/server"; 

export class ActorManager {
    private static _entities = new Map<string, ActorType>();
    private static _items = new Map<string, ActorType>();

    static setActor(target: Entity | ItemStack, actor: ActorType) {
        if (target instanceof Entity) {
            this._entities.set(target.id, actor);
            return true;
        }
        
        if (target instanceof ItemStack) {
            set_entity_dynamic_property(target, 'id', actor.uuid);
            this._items.set(actor.uuid, actor);
            return true;
        }

        return false;
    }

    static removeActor(actorId: string) {
        this._entities.forEach((actor, entityId) => {
            if (actor.uuid === actorId) this._entities.delete(entityId);
        });
        this._items.delete(actorId);
        return true;
    }

    static getActor(target: Entity | ItemStack) {
        if (target instanceof Entity) {
            const actor = this._entities.get(target.id);
            return actor;
        }

        if (target instanceof ItemStack) {
            const id = entity_dynamic_property(target, 'id');
            if (id === undefined || typeof id !== 'string') return;

            const actor = this._items.get(id);
            return actor;
        }
    }
}

/* Event */
world.beforeEvents.entityRemove.subscribe(ev => {        
    const entity = ev.removedEntity;
    system.runTimeout(() => {
        const actor = ActorManager.getActor(entity);
        if (!actor) return;
        ActorManager.removeActor(actor.uuid);
    }, 2);
});