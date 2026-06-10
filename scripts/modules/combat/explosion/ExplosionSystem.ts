import { Vector3Utils } from '@minecraft/math';
import { Dimension, Entity, EntityDamageCause, Player, Vector3 } from '@minecraft/server';

import { gameEvents } from '../../../event/EventEmitter';
import { Sound } from '../../../ui/media/Sound';
import { LoadoutManager } from '../../core/LoadoutManager';
import { MemberManager } from '../../player/MemberManager';
import { calculateExplosionDamage } from './ExplosionDamage';

export interface ExplosionSystemOptions {
    dimension: Dimension;
    location: Vector3;
    radius: number;
    minDamage: number;
    maxDamage: number;
    source?: Entity;
    sourcePlayer?: Player;
    particleType?: string;
    particleCount?: number;
    soundId?: string;
    obstacleBlocked?: boolean;
    applyArmorReduction?: boolean;
}

export class ExplosionSystem {
    static explode(options: ExplosionSystemOptions) {
        const particleType = options.particleType ?? 'minecraft:huge_explosion_emitter';
        const particleCount = options.particleCount ?? 1;

        if (options.soundId) {
            Sound.play(options.soundId);
        }

        for (let i = 0; i < particleCount; i++) {
            try {
                options.dimension.spawnParticle(particleType, options.location);
            } catch {}
        }

        for (const player of MemberManager.getPlayers({ is_alive: true })) {
            if (!player.isValid) continue;
            if (options.obstacleBlocked && this.hasObstacle(options, player)) continue;

            const distance = Vector3Utils.distance(options.location, player.location);
            const rawDamage = calculateExplosionDamage({
                distance,
                radius: options.radius,
                minDamage: options.minDamage,
                maxDamage: options.maxDamage,
            });
            if (rawDamage <= 0) continue;

            const damage =
                options.applyArmorReduction === false
                    ? rawDamage
                    : LoadoutManager.applyArmorReduction(player, rawDamage);
            this.applyDamage(player, damage, options.sourcePlayer);
        }
    }

    private static hasObstacle(options: ExplosionSystemOptions, player: Player) {
        const targetLocation = player.getHeadLocation();
        const connectVector = Vector3Utils.subtract(targetLocation, options.location);
        const distance = Vector3Utils.magnitude(connectVector);
        if (distance <= 0) return false;

        const raycast = options.dimension.getBlockFromRay(options.location, Vector3Utils.normalize(connectVector), {
            maxDistance: distance,
            includeLiquidBlocks: false,
        });
        return raycast !== undefined;
    }

    private static applyDamage(player: Player, damage: number, attacker?: Player) {
        if (!player.hasComponent('health')) return;
        const healthComp = player.getComponent('health')!;

        if (healthComp.currentValue - damage > 0) {
            healthComp.setCurrentValue(healthComp.currentValue - damage);
        } else {
            gameEvents.emit('playerDied', {
                attacker,
                deadPlayer: player,
            });
        }

        player.applyDamage(0.001, { cause: EntityDamageCause.override });
        Sound.play('PLAYER_HURT', player);
    }
}
