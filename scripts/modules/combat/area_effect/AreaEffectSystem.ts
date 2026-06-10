import { Vector3Utils } from '@minecraft/math';
import { Dimension, EntityDamageCause, Player, system, Vector3 } from '@minecraft/server';

import { gameEvents } from '../../../event/EventEmitter';
import { Sound } from '../../../ui/media/Sound';
import { MemberManager } from '../../player/MemberManager';

const PLAYER_HURT_SOUND_ID = 'game.player.hurt';

export interface FirePoint {
    location: Vector3;
    radius: number;
}

export interface FireAreaOptions {
    dimension: Dimension;
    origin: Vector3;
    duration: number; // in ticks
    points: FirePoint[];
    damageInterval: number; // in ticks
    damagePerTick: number;
    sourcePlayer?: Player;
}

export class AreaEffectSystem {
    static createFireArea(options: FireAreaOptions) {
        let elapsedTicks = 0;
        let nextDamageTick = 0;

        const intervalId = system.runInterval(() => {
            // Check for expiration
            if (elapsedTicks >= options.duration) {
                system.clearRun(intervalId);
                return;
            }

            // Render visual effects (particles)
            // Render basic flame particles around each fire point periodically
            if (elapsedTicks % 5 === 0) {
                for (const point of options.points) {
                    try {
                        const randomOffsetX = (Math.random() - 0.5) * point.radius * 2;
                        const randomOffsetZ = (Math.random() - 0.5) * point.radius * 2;
                        
                        options.dimension.spawnParticle('minecraft:basic_flame_particle', {
                            x: point.location.x + randomOffsetX,
                            y: point.location.y,
                            z: point.location.z + randomOffsetZ,
                        });
                        
                        if (Math.random() > 0.5) {
                            options.dimension.spawnParticle('minecraft:camp_fire_smoke_particle', {
                                x: point.location.x + randomOffsetX,
                                y: point.location.y + 0.5,
                                z: point.location.z + randomOffsetZ,
                            });
                        }
                    } catch {}
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

            let inRange = false;
            for (const point of options.points) {
                const distance = Vector3Utils.distance(player.location, point.location);
                if (distance <= point.radius) {
                    inRange = true;
                    break;
                }
            }

            if (inRange) {
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
