import { Entity } from "@minecraft/server";
import { DamageComponent } from "../../components/DamageComponent";
import { EntityActor } from "../Actor";

export class Glock17Bullet extends EntityActor {

    constructor(entity: Entity) {
        super('glock17bullet', entity);
        
        this.components
            .set('damage', new DamageComponent({
                near: { head: 10, body: 5, legs: 3 },
                medium: { head: 8, body: 4, legs: 2 },
                far: { head: 6, body: 3, legs: 1 }
            }));
    }

}