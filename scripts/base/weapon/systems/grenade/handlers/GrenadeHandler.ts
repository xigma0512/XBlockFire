import { EntityActor } from "../../../actors/Actor";
import { GrenadeSystem } from "../GrenadeSystem";

import { system } from "@minecraft/server";

export abstract class GrenadeHandler {
    readonly entityActor: EntityActor;

    constructor(actor: EntityActor) {
        this.entityActor = actor;
        this.spawn();
    }

    spawn() {
        if (this.entityActor.hasComponent('grenade')) {
            const grenadeComp = this.entityActor.getComponent('grenade')!;

            const entity = this.entityActor.entity;
            entity.dimension.playSound(grenadeComp.throwing_sound ?? '', entity.location, { volume: 3 });
        }
    }
    
    execute() {
        if (this.entityActor.hasComponent('grenade')) {
            const grenadeComp = this.entityActor.getComponent('grenade')!;

            const entity = this.entityActor.entity;
            entity.dimension.playSound(grenadeComp.explode_sound ?? '', entity.location, { volume: 5 });
            
            system.runTimeout(() => {
                GrenadeSystem.removeHandler(entity);
                entity.remove();
            }, 3);
        }
    }
}