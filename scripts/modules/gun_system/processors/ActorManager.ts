import { entity_dynamic_property, set_entity_dynamic_property } from "../../../utils/Property";
import { ActorType } from "../actors/Actor";

import { system, world } from "@minecraft/server";
import { Entity, ItemStack } from "@minecraft/server"; 

export class ActorManager {
    private static _entities = new Map<string, ActorType>();
    private static _items = new Map<string, ActorType>();

    static setActor(target: Entity | ItemStack, actor: ActorType): ResultType<void> {
        if (target instanceof Entity) {
            this._entities.set(target.id, actor);
            return { success: true }
        }
        
        if (target instanceof ItemStack) {
            set_entity_dynamic_property(target, 'id', actor.uuid);
            this._items.set(actor.uuid, actor);
            return { success: true }
        }

        return { success: false, err: `無效的目標類型` }
    }

    static removeActor(actorId: string): ResultType<void> {
        this._entities.forEach((actor, entityId) => {
            if (actor.uuid === actorId) this._entities.delete(entityId);
        });
        this._items.delete(actorId);
        return { success: true }
    }

    static getActor(target: Entity | ItemStack): ResultType<ActorType> {
        if (target instanceof Entity) {
            const actor = this._entities.get(target.id);
            if (actor) return { success: true, ret: actor }
            return { success: false, err: `找不到 ID 為 '${target.id}' 的實體 Actor` }
        }

        if (target instanceof ItemStack) {
            const id = entity_dynamic_property(target, 'id');
            if (id === undefined || typeof id !== 'string') {
                return { success: false, err: `${target.typeId} 缺少動態屬性 'id'` }
            }

            const actor = this._items.get(id);
            if (actor) return { success: true, ret: actor }
            return { success: false, err: `找不到 ID 為 '${id}' 的物品 Actor` }
        }

        return { success: false, err: `無效的目標類型` }
    }
}

/* Event */
world.beforeEvents.entityRemove.subscribe(ev => {        
    const entity = ev.removedEntity;
    system.run(() => {
        const { success, ret, err } = ActorManager.getActor(entity);
        if (!success) return;
        const actor = ret!;
        ActorManager.removeActor(actor.uuid);
    });
});