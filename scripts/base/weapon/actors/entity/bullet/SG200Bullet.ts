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
                near: { head: 3, body: 2, legs: 1 },
                medium: { head: 1, body: 1, legs: 0 },
                far: { head: 0, body: 0, legs: 0 }
            }));
        
        this.setEntity();
    }

}