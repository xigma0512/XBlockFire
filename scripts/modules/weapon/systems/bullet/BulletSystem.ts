import { ActorManager } from "../ActorManager";
import { EntityActor } from "../../actors/Actor";
import { DamageSystem } from "./DamageSystem";
import { BulletActorTable } from "../../actors/ActorTypeTables";

import { GunTypeEnum } from "../../../../types/weapon/WeaponEnum";

import { Vector3Utils } from "@minecraft/math";
import { Player, world } from "@minecraft/server";

export class BulletSystem {
    
    private static _instance: BulletSystem;
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

const bulletHitEntity = world.afterEvents.projectileHitEntity.subscribe(ev => {
    const attacker = ev.source;
    if (attacker === undefined || !(attacker instanceof Player)) return;
    const hitEntity = ev.getEntityHit().entity!;
    
    const projectile = ev.projectile;
    if (projectile.typeId !== 'xblockfire:bullet') return;
    
    if (!ActorManager.isActor(projectile)) return;
    const bulletActor = ActorManager.getActor(projectile) as EntityActor;
    
    new DamageSystem(attacker, hitEntity).applyBulletDamage(bulletActor, ev.location);
});

const bulletHitBlock = world.afterEvents.projectileHitBlock.subscribe(ev => {
    const projectile = ev.projectile;
    if (projectile.typeId !== 'xblockfire:bullet') return;

    // 生成彈孔
});
