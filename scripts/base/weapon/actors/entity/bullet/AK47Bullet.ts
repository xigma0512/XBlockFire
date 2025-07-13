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
                near: { head: 12, body: 8, legs: 6 },
                medium: { head: 9, body: 6, legs: 3 },
                far: { head: 4, body: 3, legs: 2 }
            }));
        
        this.setEntity();
    }

}