import { DummyEntity, EntityActor } from "../../Actor";
import { BulletComponent } from "../../../components/bullet/BulletComponent";
import { BulletDamageComponent } from "../../../components/bullet/BulletDamageComponent";
import { EntityComponent } from "../../../components/EntityComponent";

import { VanillaEntityIdentifier } from "@minecraft/server";

export class SG200Bullet extends EntityActor {

    constructor(entity: DummyEntity) {
        super('sg200bullet', entity);
        
        this.components
            .set('entity', new EntityComponent({
                entityTypeId: 'xblockfire:bullet' as VanillaEntityIdentifier
            }))
            .set('bullet', new BulletComponent({
                flightSpeed: 1000
            }))
            .set('bullet_damage', new BulletDamageComponent({
                near: { head: 4, body: 3, legs: 2 },
                medium: { head: 2, body: 1, legs: 1 },
                far: { head: 1, body: 1, legs: 1 }
            }));
        
        this.setEntity();
    }

}