import { EntityActor } from "../../../actors/Actor";
import { GrenadeHandler } from "./GrenadeHandler";

import { system } from "@minecraft/server";

export class SmokeGrenadeHandler extends GrenadeHandler {

    constructor(actor: EntityActor) {
        super(actor);

        const grenadeComp = actor.getComponent('grenade')!;
        system.runTimeout(() => this.execute(), grenadeComp.executeDelay);
    }

    execute() {
        const dimension = this.entityActor.entity.dimension;
        const location = this.entityActor.entity.location;
        
        const generatingSmoke = system.runInterval(() => {
            try { for (let i = 0; i < 2; i++) dimension.spawnParticle('minecraft:huge_explosion_emitter', location); }
            catch { }
        });
        
        const duration = 300;
        system.runTimeout(() => {
            system.clearRun(generatingSmoke);
        }, duration);

        super.execute();
    }
}