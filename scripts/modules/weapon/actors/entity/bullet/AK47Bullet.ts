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
                near: { head: 20, body: 10, legs: 8 },
                medium: { head: 16, body: 8, legs: 6 },
                far: { head: 8, body: 5, legs: 4 }
            }));
        
        this.setEntity();
    }

}