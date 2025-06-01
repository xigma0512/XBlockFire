import { entity_dynamic_property, set_entity_dynamic_property } from "../../../utils/Property";
import { IActor } from "../actors/Actor";

import { Entity, ItemStack, world } from "@minecraft/server";

export class ActorManager {
    private static _entities = new Map<string, IActor>();
    private static _items = new Map<string, IActor>();

    static setActor(target: Entity | ItemStack, actor: IActor): ResultType<void> {
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

    static removeActor(id: string): ResultType<void> {
        this._entities.delete(id);
        this._items.delete(id);
        return { success: true }
    }

    static getActor(target: Entity | ItemStack): ResultType<IActor> {
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

world.beforeEvents.entityRemove.subscribe(ev => {
    const entity = ev.removedEntity;
    const { success, ret, err } = ActorManager.getActor(entity);
    if (!success) return;
    
    ActorManager.removeActor(ret!.uuid);
});