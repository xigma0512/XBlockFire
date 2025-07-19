import { ItemActor } from "../../actors/Actor";

import { Vector3Utils } from "@minecraft/math";
import { BlockRaycastHit, DimensionLocation, Direction, Player, system, Vector3 } from "@minecraft/server";
import { OffsetCalculator } from "./OffsetCaculator";
import { getPlayerGunOffset } from "../gun/GunOffsetSystem";
import { DamageSystem } from "./BulletDamage";

const MAX_DISTANCE = 100;

export class BulletSystem {

    static shoot(owner: Player, gunActor: ItemActor) {
        const dimension = owner.dimension;
        const eyeLocation = Vector3Utils.add(owner.getHeadLocation(), { y:0.12 });
        
        const viewVector = owner.getViewDirection();
        const playerOffset = getPlayerGunOffset(owner, gunActor);
        const shootVector = OffsetCalculator.addRandomOffset(viewVector, playerOffset);

        const hitBlock = this.getHitBlockRaycast({ dimension, ...eyeLocation }, shootVector);
        const hitBlockDistance = this.getHitBlockDistance(eyeLocation, hitBlock);

        const hitEntity = this.getHitEntityRaycast(
            { dimension, ...eyeLocation },
            shootVector,
            owner.name,
            hitBlockDistance
        );

        system.run(() => {
            if (hitBlock) {
                this.spawnBulletHole(hitBlock);
            }

            if (hitEntity && hitEntity.entity instanceof Player) {
                const hitHeight = eyeLocation.y + shootVector.y * hitEntity.distance;
                DamageSystem.applyBulletDamage(owner, hitEntity.entity, gunActor, hitHeight);
            }
        });
    }

    private static getHitBlockRaycast(location: DimensionLocation, shootVector: Vector3) {
        try {
            const dimension = location.dimension;
            const raycast = dimension.getBlockFromRay(location, shootVector, { maxDistance: MAX_DISTANCE });
            return raycast;
        } catch {
            return undefined;
        }
    }

    private static getHitBlockDistance(launchLocation: Vector3, raycast: BlockRaycastHit | undefined) {
        if (raycast === undefined) return MAX_DISTANCE;
        return Vector3Utils.distance(launchLocation, raycast.block.location);
    }
    
    private static getHitEntityRaycast(location: DimensionLocation, shootVector: Vector3, shooterName: string, distance: number) {
        const dimension = location.dimension;
        if (distance == -1) distance = MAX_DISTANCE;
        const hitEntities = dimension.getEntitiesFromRay(location, shootVector, { 
            excludeNames: [ shooterName ],
            maxDistance: distance
        });
        
        if (hitEntities.length > 0) {
            return hitEntities.at(0);
        }
        return undefined;
    }

    private static spawnBulletHole(raycast: BlockRaycastHit) {
        
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
        
        const hitLocation = Vector3Utils.add(raycast.block, raycast.faceLocation);
        const spawnLocation = Vector3Utils.add(hitLocation, particleOffset[raycast.face]);

        const dimension = raycast.block.dimension;
        try { dimension.spawnParticle(particleTypes[raycast.face], spawnLocation); } catch { }
    }

}