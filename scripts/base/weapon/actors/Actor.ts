import { Component, ComponentTypes } from "../components/Component";
import { ActorManager } from "../systems/ActorManager";

import { randomUUID } from "../../../shared/utils/others/Common";

import { Dimension, Entity, ItemStack, Vector3 } from "@minecraft/server";

export type ActorType = EntityActor | ItemActor;

abstract class Actor {
    readonly typeId: string;
    readonly uuid: string;
    protected readonly components = new Map<keyof ComponentTypes, Component>;

    constructor(typeId: string) {
        this.typeId = typeId;
        this.uuid = randomUUID();
    }

    hasComponent(componentId: keyof ComponentTypes) {
        return this.components.has(componentId);
    }

    getComponent<T extends keyof ComponentTypes>(componentId: T) {
        return this.components.get(componentId) as ComponentTypes[T] | undefined;
    }
}

export interface DummyEntity {
    dimension: Dimension;
    location: Vector3;
}

export abstract class EntityActor extends Actor {
    
    // readonly entity: Entity;
    private _entity: Entity | DummyEntity;
    get entity() { return this._entity as Entity; };

    constructor(typeId: string, entity: Entity | DummyEntity) {
        super(typeId);
        this._entity = entity;

        if (entity instanceof Entity) {
            ActorManager.setActor(entity, this);
        }
    }

    protected setEntity() {
        const entityComp = this.getComponent('entity')!;
        const dimension = this._entity.dimension;
        const location = this._entity.location;

        this._entity = dimension.spawnEntity(entityComp.entityTypeId, location, entityComp.spawnOptions);
        ActorManager.setActor(this.entity, this);
    }
}

export abstract class ItemActor extends Actor {
    readonly item: ItemStack;
    constructor(typeId: string, item: ItemStack) {
        super(typeId);
        this.item = item;

        ActorManager.setActor(item, this);
    }

    protected setItem() {
        const itemComp = this.getComponent('item')!;

        this.item.nameTag = itemComp.nametag;
        this.item.setLore(itemComp.lore);
        this.item.keepOnDeath = itemComp.keepOnDeath;
        this.item.lockMode = itemComp.lockMode;
        this.item.setCanDestroy(itemComp.canDestroy);
        this.item.setCanPlaceOn(itemComp.canPlaceOn);
    }

    abstract clone(): ItemActor;
}