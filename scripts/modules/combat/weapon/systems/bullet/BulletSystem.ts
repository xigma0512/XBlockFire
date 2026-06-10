import { InvincibilitySystem } from '../../../InvincibilitySystem';
import { ItemActor } from '../../actors/Actor';
import { getPlayerGunOffset } from '../gun/GunOffsetSystem';
import { BulletAnimation } from './BulletAnimation';
import { DamageSystem } from './BulletDamage';
import { OffsetCalculator } from './OffsetCaculator';

import { entity_dynamic_property } from '../../../../../utils/Property';

import { Vector3Utils } from '@minecraft/math';
import { BlockRaycastHit, DimensionLocation, Player, system, Vector3 } from '@minecraft/server';

const MAX_DISTANCE = 100;

export class BulletSystem {
    static shoot(owner: Player, gunActor: ItemActor) {
        const dimension = owner.dimension;
        const eyeLocation = Vector3Utils.add(owner.getHeadLocation(), { y: 0.12 });

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
            // Determine the actual stopping distance (entity takes precedence if closer)
            let finalDistance = hitBlockDistance;
            if (hitEntity && hitEntity.distance < hitBlockDistance) {
                finalDistance = hitEntity.distance;
            }

            // Calculate exact physical hit location: Start + (Direction * Distance)
            const exactHitLocation = Vector3Utils.add(eyeLocation, Vector3Utils.scale(shootVector, finalDistance));

            // Spawn visual effects at the exact point
            BulletAnimation.spawnBulletEffects(owner, exactHitLocation, hitBlock);

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

    private static getHitEntityRaycast(
        location: DimensionLocation,
        shootVector: Vector3,
        shooterName: string,
        distance: number
    ) {
        const dimension = location.dimension;
        if (distance == -1) distance = MAX_DISTANCE;
        const hitEntities = dimension
            .getEntitiesFromRay(location, shootVector, {
                excludeNames: [shooterName],
                maxDistance: distance,
            })
            .filter((raycast) => entity_dynamic_property(raycast.entity, 'player:is_alive'))
            .filter((raycast) => {
                if (raycast.entity instanceof Player) {
                    return !InvincibilitySystem.isInvincible(raycast.entity);
                }
                return true;
            });

        if (hitEntities.length > 0) {
            return hitEntities.at(0);
        }
        return undefined;
    }
}
