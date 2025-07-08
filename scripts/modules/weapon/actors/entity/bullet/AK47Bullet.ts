import { DummyEntity, EntityActor } from "../../Actor";
import { BulletComponent } from "../../../components/bullet/BulletComponent";
import { BulletDamageComponent } from "../../../components/bullet/BulletDamageComponent";
import { EntityComponent } from "../../../components/EntityComponent";

import { VanillaEntityIdentifier } from "@minecraft/server";

export class AK47Bullet extends EntityActor {

    constructor(entity: DummyEntity) {
        super('ak47bullet', entity);
        
        this.components
            .set('entity', new EntityComponent({
                entityTypeId: 'xblockfire:bullet' as VanillaEntityIdentifier
            }))
            .set('bullet', new BulletComponent({
                flightSpeed: 1000
            }))
            .set('bullet_damage', new BulletDamageComponent({
                near: { head: 14, body: 10, legs: 8 },
                medium: { head: 13, body: 8, legs: 6 },
                far: { head: 5, body: 4, legs: 3 }
            }));
        
        this.setEntity();
    }

}