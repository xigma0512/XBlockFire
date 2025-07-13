import { ActorManager } from "../ActorManager";
import { EntityActor } from "../../actors/Actor";
import { DamageSystem } from "./DamageSystem";
import { BulletActorTable } from "../../actors/ActorTypeTables";

import { GunTypeEnum } from "../../../../types/weapon/WeaponEnum";

import { Vector3Utils } from "@minecraft/math";
import { Direction, Player, world } from "@minecraft/server";

class _BulletSystem {
    
    private static _instance: _BulletSystem;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private constructor() {
    }

    spawnBullet(player: Player, gunType: GunTypeEnum, shootOffset: number) {
        const headLocation = player.getHeadLocation();
        const viewDirection = player.getViewDirection();
        const spawnLocation = Vector3Utils.add(Vector3Utils.add(headLocation, viewDirection), { y:0.1 });

        const bulletActor = new BulletActorTable[gunType]({
            dimension: player.dimension,
            location: spawnLocation
        });
        const bulletComp = bulletActor.getComponent('bullet')!;

        const projComp = bulletActor.entity.getComponent('projectile')!;
        projComp.owner = player;
        projComp.shoot(
            Vector3Utils.scale(viewDirection, bulletComp.flightSpeed),
            { uncertainty: shootOffset }
        );
    }

}

export const BulletSystem = _BulletSystem.instance;

const bulletHitEntity = world.afterEvents.projectileHitEntity.subscribe(ev => {
    const attacker = ev.source;
    if (attacker === undefined || !(attacker instanceof Player)) return;
    
    const hitEntity = ev.getEntityHit().entity!;
    if (!(hitEntity instanceof Player)) return;
    
    const projectile = ev.projectile;
    if (projectile.typeId !== 'xblockfire:bullet') return;
    
    if (!ActorManager.isActor(projectile)) return;
    const bulletActor = ActorManager.getActor(projectile) as EntityActor;
    
    new DamageSystem(attacker, hitEntity).applyBulletDamage(bulletActor, ev.location);
});

const bulletHitBlock = world.afterEvents.projectileHitBlock.subscribe(ev => {
    const projectile = ev.projectile;
    if (projectile.typeId !== 'xblockfire:bullet') return;
    
    const offsetValue = 0.02;
    const particleOffset = {
        [Direction.Up]: { y: 1 + offsetValue },
        [Direction.Down]: { y: -offsetValue },
        [Direction.South]: { z: 1 + offsetValue },
        [Direction.North]: { z: -offsetValue },
        [Direction.East]: { x: 1 + offsetValue },
        [Direction.West]: { x: -offsetValue }
    }

    const particleTypes = {
        [Direction.Up]: 'xblockfire:bullet_hole_xz',
        [Direction.Down]: 'xblockfire:bullet_hole_xz',
        [Direction.South]: 'xblockfire:bullet_hole_xy',
        [Direction.North]: 'xblockfire:bullet_hole_xy',
        [Direction.East]: 'xblockfire:bullet_hole_yz',
        [Direction.West]: 'xblockfire:bullet_hole_yz'
    }

    const hitBlockInfo = ev.getBlockHit();
    const spawnLocation = Vector3Utils.add(Vector3Utils.add(hitBlockInfo.block.location, hitBlockInfo.faceLocation), particleOffset[hitBlockInfo.face]);

    ev.dimension.spawnParticle(particleTypes[hitBlockInfo.face], spawnLocation);

    projectile.remove();
});
