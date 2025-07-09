import { GrenadeHandler } from "./handlers/GrenadeHandler";

import { GrenadeTypeEnum } from "../../../../types/weapon/WeaponEnum";
import { GrenadeActorTable } from "../../actors/ActorTypeTables";
import { SmokeGrenadeHandler } from "./handlers/SmokeGrenade";
import { FlashbangHandler } from "./handlers/Flashbang";

import { entity_native_property } from "../../../../utils/Property";

import { Vector3Utils } from "@minecraft/math";
import { Entity, world } from "@minecraft/server";
import { Direction } from "@minecraft/server";


class _GrenadeSystem {

    private static _instance: _GrenadeSystem;
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

export const GrenadeSystem = _GrenadeSystem.instance;

const handlerRegister = world.afterEvents.entitySpawn.subscribe(ev => {
    if (!ev.entity.isValid) return;
    const familyComp = ev.entity.getComponent('type_family');
    if (familyComp === undefined || !familyComp.hasTypeFamily('grenade')) return;

    const grenade = ev.entity;
    const grenadeType = entity_native_property(grenade, 'grenade:type');

    const grenadeActor = new GrenadeActorTable[grenadeType](grenade);
    const handlers = {
        [GrenadeTypeEnum.SmokeGrenade]: SmokeGrenadeHandler,
        [GrenadeTypeEnum.Flashbang]: FlashbangHandler
    }

    GrenadeSystem.setHandler(grenade, new handlers[grenadeType](grenadeActor));
});

const bounces = new WeakMap<Entity, number>();
const grenadeRebound = world.afterEvents.projectileHitBlock.subscribe(ev => {
    
    const projectile = ev.projectile;
    if (!projectile.isValid) return;
    const familyComp = projectile.getComponent('type_family');
    if (familyComp === undefined || !familyComp.hasTypeFamily('grenade')) return;

    const MirroredVector = {
        [Direction.Down]: {x:1,y:-1,z:1},
        [Direction.Up]: {x:1,y:-1,z:1},
        [Direction.West]: {x:-1,y:1,z:1},
        [Direction.East]: {x:-1,y:1,z:1},
        [Direction.North]: {x:1,y:1,z:-1},
        [Direction.South]: {x:1,y:1,z:-1},
    };

    const offsetValue = 0.1;
    const teleportOffset = {
        [Direction.Up]: { y: 1 + offsetValue },
        [Direction.Down]: { y: -offsetValue },
        [Direction.South]: { z: 1 + offsetValue },
        [Direction.North]: { z: -offsetValue },
        [Direction.East]: { x: 1 + offsetValue },
        [Direction.West]: { x: -offsetValue }
    }

    const handler = GrenadeSystem.getHandler(projectile);
    if (handler === undefined) return;

    if (!bounces.has(projectile)) bounces.set(projectile, 1);
    
    const count = bounces.get(projectile)!;
    const hitBlockInfo = ev.getBlockHit();
    projectile.teleport(Vector3Utils.add(Vector3Utils.add(hitBlockInfo.block.location, hitBlockInfo.faceLocation), teleportOffset[hitBlockInfo.face]));

    bounces.set(projectile, count + 1);
    
    const projReboundComp = handler.entityActor.getComponent('projectile_rebound')!;
    const bounceFactor = projReboundComp.bounceFactor;
    
    const reboundVector = Vector3Utils.multiply(Vector3Utils.scale(ev.hitVector, Math.pow(bounceFactor, count)), MirroredVector[hitBlockInfo.face]);
    if (Vector3Utils.magnitude(reboundVector) <= 0.01) return;
    projectile.getComponent('projectile')!.shoot(reboundVector);
});