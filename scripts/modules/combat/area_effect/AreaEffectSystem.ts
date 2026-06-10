import { Dimension, EntityDamageCause, Player, system, Vector3 } from '@minecraft/server';

import { gameEvents } from '../../../event/EventEmitter';
import { Sound } from '../../../ui/media/Sound';
import { MemberManager } from '../../player/MemberManager';

const PLAYER_HURT_SOUND_ID = 'game.player.hurt';

export interface FireAreaOptions {
    dimension: Dimension;
    origin: Vector3;
    duration: number; // in ticks
    radius: number;
    damageInterval: number; // in ticks
    damagePerTick: number;
    sourcePlayer?: Player;
}

export class AreaEffectSystem {
    static createFireArea(options: FireAreaOptions) {
        let elapsedTicks = 0;
        let nextDamageTick = 0;

        const validSurfaces: Vector3[] = [];
        const maxR = Math.ceil(options.radius);
        const origin = options.origin;
        const floorY = Math.floor(origin.y);

        // Pre-calculate all valid top surfaces within the cylinder
        for (let dx = -maxR; dx <= maxR; dx++) {
            for (let dz = -maxR; dz <= maxR; dz++) {
                if (dx * dx + dz * dz > options.radius * options.radius) continue;
                
                const x = Math.floor(origin.x) + dx;
                const z = Math.floor(origin.z) + dz;
                
                let bestSurface: Vector3 | null = null;
                let minDiff = Infinity;
                
                for (let dy = 3; dy >= -3; dy--) {
                    const y = floorY + dy;
                    const block = options.dimension.getBlock({ x, y, z });
                    const blockAbove = block?.above();
                    
                    if (block && !block.isAir && blockAbove && blockAbove.isAir) {
                        if ((y + 1) <= origin.y + 3 && (y + 1) >= origin.y - 3) {
                            const diff = Math.abs((y + 1) - origin.y);
                            if (diff < minDiff) {
                                minDiff = diff;
                                bestSurface = { x: x + 0.5, y: y + 1, z: z + 0.5 };
                            }
                        }
                    }
                }
                
                if (bestSurface) {
                    validSurfaces.push(bestSurface);
                }
            }
        }

        const intervalId = system.runInterval(() => {
            // Check for expiration
            if (elapsedTicks >= options.duration) {
                system.clearRun(intervalId);
                return;
            }

            // Render visual effects (particles)
            if (elapsedTicks % 5 === 0) {
                for (const surface of validSurfaces) {
                    const randomOffsetX = (Math.random() - 0.5) * 0.8;
                    const randomOffsetZ = (Math.random() - 0.5) * 0.8;
                    
                    for (let i=0; i<10; i++) {
                        options.dimension.spawnParticle('minecraft:basic_flame_particle', {
                            x: surface.x + randomOffsetX,
                            y: surface.y,
                            z: surface.z + randomOffsetZ,
                        });
                    }
                }
            }

            // Handle damage
            if (elapsedTicks >= nextDamageTick) {
                this.applyDamageToPlayers(options);
                nextDamageTick += options.damageInterval;
            }

            elapsedTicks++;
        }, 1);
    }

    private static applyDamageToPlayers(options: FireAreaOptions) {
        for (const player of MemberManager.getPlayers({ is_alive: true })) {
            if (!player.isValid) continue;

            const dx = player.location.x - options.origin.x;
            const dz = player.location.z - options.origin.z;
            const dy = player.location.y - options.origin.y;

            // Damage applies if within the radius and within y +/- 3 cylinder
            if (dx * dx + dz * dz <= options.radius * options.radius && dy >= -3 && dy <= 3) {
                this.applyDamage(player, options.damagePerTick, options.sourcePlayer);
            }
        }
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
        Sound.playTo(PLAYER_HURT_SOUND_ID, player);
    }
}
