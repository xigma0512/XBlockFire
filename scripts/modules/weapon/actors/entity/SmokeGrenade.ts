import { EntityActor } from "../Actor";
import { ProjectileReboundComponent } from "../../components/ProjectileReboundComponent";
import { entity_native_property } from "../../../../utils/Property";

import { Entity } from "@minecraft/server";
import { GrenadeComponent } from "../../components/GrenadeComponent";
import { GrenadeTypeEnum } from "../../types/Enums";

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
                    executeDelay: (throwingType === 0 ? 70 : 40)
                }
            ));
    }

}