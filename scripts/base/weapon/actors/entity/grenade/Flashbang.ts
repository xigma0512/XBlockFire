import { EntityActor } from "../../Actor";
import { ProjectileReboundComponent } from "../../../components/ProjectileReboundComponent";
import { entity_native_property } from "../../../../../shared/utils/Property";

import { Entity } from "@minecraft/server";
import { GrenadeComponent } from "../../../components/GrenadeComponent";
import { GrenadeTypeEnum } from "../../../../../shared/types/weapon/WeaponEnum";

export class Flashbang extends EntityActor {

    constructor(entity: Entity) {
        super('flashbang', entity);
        
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
                    executeDelay: (throwingType === 0 ? 40 : 20),
                    throwing_sound: 'xblockfire.throwing_flash',
                    explode_sound: 'xblockfire.flash_explode'
                }
            ));
    }

}