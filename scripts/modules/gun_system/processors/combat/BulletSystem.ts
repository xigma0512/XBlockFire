import { BulletActorTable } from "./BulletTypeTable";
import { spawnDummyEntity } from "../../../../utils/Utils";
import { GunTypeEnum } from "../../types/Enums";

import { Entity, Player, world } from "@minecraft/server";
import { Vector3Utils } from "@minecraft/math";

export class BulletSystem {
    
    private static _instance: BulletSystem;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private constructor() {
    }

    spawnBullet(player: Player, gunType: GunTypeEnum, shootOffset: number) {
        const headLocation = player.getHeadLocation();
        const viewDirection = player.getViewDirection();
        const spawnLocation = Vector3Utils.add(Vector3Utils.add(headLocation, viewDirection), { y:0.1 });

        const bulletActor = new BulletActorTable[gunType](spawnDummyEntity({dimension: player.dimension, ...spawnLocation}));
        const bulletComp = bulletActor.getComponent('bullet')!;

        const projComp = bulletActor.entity.getComponent('projectile')!;
        projComp.owner = player;
        projComp.shoot(
            Vector3Utils.scale(viewDirection, bulletComp.flightSpeed),
            { uncertainty: shootOffset }
        );
    }

    applyBulletDamage(bulletEntity: Entity, hitEntity: Entity) {
        console.warn('hit')
    }
}

const bulletHitEntity = world.afterEvents.projectileHitEntity.subscribe(ev => {
    const source = ev.source;
    if (source === undefined) return;

    const projectile = ev.projectile;
    if (projectile.typeId !== 'xblockfire:bullet') return;

    const hitEntity = ev.getEntityHit().entity!;
    BulletSystem.instance.applyBulletDamage(projectile, hitEntity);
});

const bulletHitBlock = world.afterEvents.projectileHitBlock.subscribe(ev => {
    const projectile = ev.projectile;
    if (projectile.typeId !== 'xblockfire:bullet') return;

    // 生成彈孔
});
