import { EntityActor } from "../../Actor";
import { ProjectileReboundComponent } from "../../../components/ProjectileReboundComponent";
import { entity_native_property } from "../../../../../infrastructure/data/Property";

import { GrenadeComponent } from "../../../components/GrenadeComponent";
import { GrenadeTypeEnum } from "../../../../../declarations/enum/WeaponEnum";

import { Entity } from "@minecraft/server";

export class SmokeGrenade extends EntityActor {

    constructor(entity: Entity) {
        super('smoke_grenade', entity);
        
        const throwingType = entity_native_property(entity, 'grenade:throwing_type');
        this.components
            .set('projectile_rebound', new ProjectileReboundComponent(
                {
                    bounceFactor: (throwingType === 0 ? 0.6 : 0.2)
                }
            ))
            .set('grenade', new GrenadeComponent(
                {
                    grenadeTypeId: GrenadeTypeEnum.Flashbang,
                    executeDelay: (throwingType === 0 ? 70 : 40),
                    throwing_sound: 'xblockfire.throwing_smoke',
                    explode_sound: 'xblockfire.smoke_explode'
                }
            ));
    }

}