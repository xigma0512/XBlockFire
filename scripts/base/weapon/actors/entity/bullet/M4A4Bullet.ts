import { DummyEntity, EntityActor } from "../../Actor";
import { BulletComponent } from "../../../components/bullet/BulletComponent";
import { BulletDamageComponent } from "../../../components/bullet/BulletDamageComponent";
import { EntityComponent } from "../../../components/EntityComponent";

import { VanillaEntityIdentifier } from "@minecraft/server";

export class M4A4Bullet extends EntityActor {

    constructor(entity: DummyEntity) {
        super('m4a4bullet', entity);
        
        this.components
            .set('entity', new EntityComponent({
                entityTypeId: 'xblockfire:bullet' as VanillaEntityIdentifier
            }))
            .set('bullet', new BulletComponent({
                flightSpeed: 1000
            }))
            .set('bullet_damage', new BulletDamageComponent({
                near: { head: 8, body: 4, legs: 3 },
                medium: { head: 6, body: 3, legs: 2 },
                far: { head: 4, body: 2, legs: 1 } 
            }));
        
        this.setEntity();
    }

}