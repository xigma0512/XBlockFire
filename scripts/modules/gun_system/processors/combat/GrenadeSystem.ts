import { EntityActor } from "../../actors/Actor";
import { GrenadeActorTable } from "../../types/ActorTypeTables";
import { entity_native_property } from "../../../../utils/Property";

import { Vector3Builder, Vector3Utils } from "@minecraft/math";
import { Entity, Player, system, world } from "@minecraft/server";
import { Vector3 } from "@minecraft/server";

abstract class GrenadeHandler {
    readonly entityActor: EntityActor;

    constructor(actor: EntityActor) {
        this.entityActor = actor;
    }
    
    execute() {
        const grenadeComp = this.entityActor.getComponent('grenade')!;
        for (const event of grenadeComp.executeEvent ?? []) {
            this.entityActor.entity.triggerEvent(event);
        }
    }
}

class SmokeGrenadeHandler extends GrenadeHandler {

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
            GrenadeSystem.instance.removeHandler(this.entityActor.entity);
        }, duration);

        super.execute();
    }
}

class FlashbangHandler extends GrenadeHandler {

    constructor(actor: EntityActor) {
        super(actor);

        const grenadeComp = actor.getComponent('grenade')!;
        system.runTimeout(() => this.execute(), grenadeComp.executeDelay);
    }

    execute() {
        const dimension = this.entityActor.entity.dimension;
        
        for (const player of dimension.getPlayers()) {
            const raycast = this.detectObstacle(player);
            if (raycast && raycast.block) continue;
    
            const blindLevel = this.getBlindLevel(player);
            this.applyBlindEffect(player, blindLevel.duration, blindLevel.fadeOut);
        }

        super.execute();
    }
    
    private detectObstacle(player: Player) {
        const dimension = player.dimension;
        const location = this.entityActor.entity.location;
        const headLocation = player.getHeadLocation();
        
        const connectVector = new Vector3Builder(Vector3Utils.subtract(location, headLocation));
        
        const raycast = dimension.getBlockFromRay(headLocation, connectVector.normalize(), { 
            maxDistance: connectVector.magnitude()
        });
        return raycast;
    }

    private getBlindLevel(player: Player) {

        const BlindLevels = [
            { min: 0, max: 50, duration: 1.8, fadeOut: 4.5 },
            { min: 50, max: 75, duration: 1, fadeOut: 3.7 },
            { min: 75, max: 135, duration: 0.75, fadeOut: 2.5 },
        ];

        const flatten = (vec: Vector3) => new Vector3Builder(vec.x, 0, vec.z);

        const entityLocation2d = flatten(this.entityActor.entity.location);
        const headLocation2d = flatten(player.getHeadLocation());
        const viewDirection2d = flatten(player.getViewDirection());
        const connect = new Vector3Builder(entityLocation2d).subtract(headLocation2d);

        const dot = Vector3Utils.dot(viewDirection2d, connect);
        const rad = Math.acos(dot / (viewDirection2d.magnitude() * connect.magnitude()));
        const deg = rad * (180 / Math.PI);
        
        for (const level of BlindLevels) {
            if (deg >= level.min && deg <= level.max) {
                return { duration: level.duration, fadeOut: level.fadeOut };
            }
        }
        return { duration: 0.1, fadeOut: 1 };
    }

    private applyBlindEffect(player: Player, duration: number, fadeOut: number) {
        player.camera.fade({
            fadeColor: {
                red: 1,
                green: 0.95,
                blue: 0.95
            },
            fadeTime: {
                fadeInTime: 0.1,
                holdTime: duration,
                fadeOutTime: fadeOut
            }
        });
    }
}

class GrenadeSystem {

    private static _instance: GrenadeSystem;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private _grenades: Map<Entity, GrenadeHandler>;

    constructor() {
        this._grenades = new Map();
    }

    getHandler(entity: Entity) {
        return this._grenades.get(entity);
    }

    setHandler(entity: Entity, handler: GrenadeHandler) {
        this._grenades.set(entity, handler);
    }

    removeHandler(entity: Entity) {
        this._grenades.delete(entity);
    }

}

const handlerRegister = world.afterEvents.entitySpawn.subscribe(ev => {
    if (!ev.entity.matches({families: ['grenade']})) return;

    const grenade = ev.entity;
    const grenadeType = entity_native_property(grenade, 'grenade:type');
    const grenadeActor = new GrenadeActorTable[grenadeType](grenade);

    if (grenade.typeId === 'xblockfire:flashbang') GrenadeSystem.instance.setHandler(grenade, new FlashbangHandler(grenadeActor));
    if (grenade.typeId === 'xblockfire:smoke_grenade') GrenadeSystem.instance.setHandler(grenade, new SmokeGrenadeHandler(grenadeActor));

    console.warn('hi')
});