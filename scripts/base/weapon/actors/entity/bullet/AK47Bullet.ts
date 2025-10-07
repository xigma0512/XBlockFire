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
                near: { head: 14, body: 11, legs: 9 },
                medium: { head: 11, body: 9, legs: 7 },
                far: { head: 7, body: 5, legs: 4 }
            }));
        
        this.setEntity();
    }

}