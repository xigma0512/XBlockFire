import { gameEvents } from '../../../../../event/EventEmitter';
import { Sound } from '../../../../../ui/media/Sound';
import { LoadoutManager } from '../../../../core/LoadoutManager';
import { MemberManager } from '../../../../player/MemberManager';

import { ItemActor } from '../../actors/Actor';

import { Vector3Utils } from '@minecraft/math';
import { EntityDamageCause, Player } from '@minecraft/server';

const NEAR_DISTANCE = 7;
const MEDIUM_DISTANCE = 20;
const PLAYER_HURT_SOUND_ID = 'game.player.hurt';
const PLAYER_HIT_SOUND_ID = 'damage.fallsmall';

export class DamageSystem {
    static applyBulletDamage(attacker: Player, target: Player, gunActor: ItemActor, hitHeight: number) {
        if (this.isTeamDamage(attacker, target)) return;

        const distance = this.getDistance(attacker, target);
        const hitPart = this.getHitPart(target, hitHeight);

        const damageComp = gunActor.getComponent('gun_damage')!;
        const rawDamage = damageComp[distance][hitPart];
        const damage = LoadoutManager.applyArmorReduction(target, rawDamage);

        if (!target.hasComponent('health')) return;
        const healthComp = target.getComponent('health')!;

        if (healthComp.currentValue - damage > 0) {
            healthComp.setCurrentValue(healthComp.currentValue - damage);
        } else {
            gameEvents.emit('playerDied', {
                attacker: attacker,
                deadPlayer: target,
            });
        }

        target.addEffect('slowness', 5, { amplifier: 0, showParticles: false });
        Sound.playTo(PLAYER_HURT_SOUND_ID, target);
        target.applyDamage(0.001, { cause: EntityDamageCause.override });
        Sound.playTo(PLAYER_HIT_SOUND_ID, attacker, { pitch: 2.5 });
    }

    private static isTeamDamage(attacker: Player, target: Player) {
        const attackerTeam = MemberManager.getPlayerTeam(attacker);
        const targetTeam = MemberManager.getPlayerTeam(target);
        return attackerTeam === targetTeam;
    }

    private static getDistance(attacker: Player, target: Player): DamageDistanceType {
        const distance = Vector3Utils.distance(attacker.location, target.location);
        if (distance <= NEAR_DISTANCE) return 'near';
        if (distance <= MEDIUM_DISTANCE) return 'medium';
        return 'far';
    }

    private static getHitPart(target: Player, hitHeight: number): BulletHitPartType {
        if (!(target instanceof Player)) return 'head';
        const targetFeetHeight = target.location.y;

        const height = Math.abs(hitHeight - targetFeetHeight);

        if (height <= 0.85) return 'legs';
        if (height <= 1.45) return 'body';
        return 'head';
    }
}
