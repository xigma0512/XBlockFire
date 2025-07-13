import { DummyEntity, EntityActor } from "../../Actor";
import { BulletComponent } from "../../../components/bullet/BulletComponent";
import { BulletDamageComponent } from "../../../components/bullet/BulletDamageComponent";
import { EntityComponent } from "../../../components/EntityComponent";

import { VanillaEntityIdentifier } from "@minecraft/server";

export class DeagleBullet extends EntityActor {

    constructor(entity: DummyEntity) {
        super('deaglebullet', entity);
        
        this.components
            .set('entity', new EntityComponent({
                entityTypeId: 'xblockfire:bullet' as VanillaEntityIdentifier
            }))
            .set('bullet', new BulletComponent({
                flightSpeed: 1000
            }))
            .set('bullet_damage', new BulletDamageComponent({
                near: { head: 12, body: 8, legs: 5 },
                medium: { head: 8, body: 5, legs: 3 },
                far: { head: 5, body: 3, legs: 3 }
            }));
        
        this.setEntity();
    }

}