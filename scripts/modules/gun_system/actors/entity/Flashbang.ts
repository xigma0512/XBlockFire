import { EntityActor } from "../Actor";
import { ProjectileReboundComponent } from "../../components/ProjectileReboundComponent";
import { entity_native_property } from "../../../../utils/Property";

import { Entity } from "@minecraft/server";

export class Flashbang extends EntityActor {

    constructor(entity: Entity) {
        super('flashbang', entity);
        
        this.components
            .set('projectile_rebound', new ProjectileReboundComponent(
                {
                    bounceFactor: (entity_native_property(entity, 'grenade:throwing_type') === 0 ? 0.6 : 0.2)
                }
            ));
    }

}