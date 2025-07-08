import { DummyEntity, EntityActor } from "../../Actor";
import { BulletComponent } from "../../../components/bullet/BulletComponent";
import { BulletDamageComponent } from "../../../components/bullet/BulletDamageComponent";
import { EntityComponent } from "../../../components/EntityComponent";

import { Entity, VanillaEntityIdentifier } from "@minecraft/server";

export class Glock17Bullet extends EntityActor {

    constructor(entity: DummyEntity) {
        super('glock17bullet', entity);
        
        this.components
            .set('entity', new EntityComponent({
                entityTypeId: 'xblockfire:bullet' as VanillaEntityIdentifier
            }))
            .set('bullet', new BulletComponent({
                flightSpeed: 1000
            }))
            .set('bullet_damage', new BulletDamageComponent({
                near: { head: 10, body: 5, legs: 4 },
                medium: { head: 8, body: 4, legs: 3 },
                far: { head: 4, body: 2, legs: 1 }
            }));
        
        this.setEntity();
    }

}