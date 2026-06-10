import { GrenadeHandler } from './handlers/GrenadeHandler';

import { entity_native_property } from '../../../../../utils/Property';

import { Entity, world } from '@minecraft/server';
import { createGrenadeHandler } from './GrenadeRegistry';

export class GrenadeSystem {
    private static _grenades = new Map<Entity, GrenadeHandler>();

    static getHandler(entity: Entity) {
        return this._grenades.get(entity);
    }

    static setHandler(entity: Entity, handler: GrenadeHandler) {
        this._grenades.set(entity, handler);
    }

    static removeHandler(entity: Entity) {
        this._grenades.delete(entity);
    }
}

world.afterEvents.entitySpawn.subscribe((ev) => {
    if (!ev.entity.isValid) return;
    if (ev.entity.hasComponent('type_family')) {
        const familyComp = ev.entity.getComponent('type_family')!;
        if (!familyComp.hasTypeFamily('grenade')) return;

        const grenade = ev.entity;
        const grenadeType = entity_native_property(grenade, 'grenade:type');

        GrenadeSystem.setHandler(grenade, createGrenadeHandler(grenadeType, grenade));
    }
});
