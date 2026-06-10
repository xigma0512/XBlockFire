import { Vector3Utils } from '@minecraft/math';
import { Entity, world } from '@minecraft/server';
import { GrenadeSystem } from './GrenadeSystem';

import type { Vector3 } from '@minecraft/server';

export type GrenadeBounceFace = 'Down' | 'Up' | 'West' | 'East' | 'North' | 'South';

const mirroredVector: Record<GrenadeBounceFace, Vector3> = {
    Down: { x: 1, y: -1, z: 1 },
    Up: { x: 1, y: -1, z: 1 },
    West: { x: -1, y: 1, z: 1 },
    East: { x: -1, y: 1, z: 1 },
    North: { x: 1, y: 1, z: -1 },
    South: { x: 1, y: 1, z: -1 },
};

const offsetValue = 0.1;
const teleportOffset: Record<GrenadeBounceFace, Partial<Vector3>> = {
    Up: { y: 1 + offsetValue },
    Down: { y: -offsetValue },
    South: { z: 1 + offsetValue },
    North: { z: -offsetValue },
    East: { x: 1 + offsetValue },
    West: { x: -offsetValue },
};

export function getGrenadeTeleportOffset(face: GrenadeBounceFace) {
    return teleportOffset[face];
}

export function calculateGrenadeReboundVector(
    hitVector: Vector3,
    face: GrenadeBounceFace,
    bounceFactor: number,
    bounceCount: number
): Vector3 {
    const falloff = Math.pow(bounceFactor, bounceCount);
    const mirror = mirroredVector[face];

    return {
        x: hitVector.x * falloff * mirror.x,
        y: hitVector.y * falloff * mirror.y,
        z: hitVector.z * falloff * mirror.z,
    };
}


const bounces = new WeakMap<Entity, number>();

world.afterEvents.projectileHitBlock.subscribe((ev) => {
    const projectile = ev.projectile;
    if (!projectile.isValid) return;
    if (!projectile.hasComponent('type_family')) return;

    const familyComp = projectile.getComponent('type_family')!;
    if (!familyComp.hasTypeFamily('grenade')) return;

    const handler = GrenadeSystem.getHandler(projectile);
    if (handler === undefined) return;

    if (!bounces.has(projectile)) bounces.set(projectile, 1);

    const count = bounces.get(projectile)!;
    const hitBlockInfo = ev.getBlockHit();
    const face = hitBlockInfo.face as GrenadeBounceFace;

    projectile.teleport(
        Vector3Utils.add(
            Vector3Utils.add(hitBlockInfo.block.location, hitBlockInfo.faceLocation),
            getGrenadeTeleportOffset(face)
        )
    );

    bounces.set(projectile, count + 1);

    const projReboundComp = handler.entityActor.getComponent('projectile_rebound')!;
    const reboundVector = calculateGrenadeReboundVector(
        ev.hitVector,
        face,
        projReboundComp.bounceFactor,
        count
    );
    if (Vector3Utils.magnitude(reboundVector) <= 0.01) return;

    projectile.getComponent('projectile')!.shoot(reboundVector);
    const soundId = handler.entityActor.getComponent('grenade')?.bounce_sound;
    projectile.dimension.playSound(soundId ?? '', projectile.location, { volume: 2 });
});
