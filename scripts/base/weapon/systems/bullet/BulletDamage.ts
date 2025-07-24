import { gameEvents } from "../../../../event/EventEmitter";

import { ItemActor } from "../../actors/Actor";

import { entity_dynamic_property } from "../../../../utils/Property";

import { Vector3Utils } from "@minecraft/math";
import { EntityDamageCause, Player } from "@minecraft/server";

const NEAR_DISTANCE = 10;
const MEDIUM_DISTANCE = 30;

export class DamageSystem {
    static applyBulletDamage(attacker: Player, target: Player, gunActor: ItemActor, hitHeight: number) {
        if (this.isTeamDamage(attacker, target)) return;
        
        const distance = this.getDistance(attacker, target);
        const hitPart = this.getHitPart(target, hitHeight);
        
        const damageComp = gunActor.getComponent('gun_damage')!;
        const damage = damageComp[distance][hitPart];
        
        if (!target.hasComponent('health')) return;
        const healthComp = target.getComponent('health')!;
        
        if (healthComp.currentValue - damage > 0) {
            healthComp.setCurrentValue(healthComp.currentValue - damage);
        } else {
            gameEvents.emit('playerDied', {
                attacker: attacker,
                deadPlayer: target
            });
        }

        target.addEffect('slowness', 5, {amplifier: 0, showParticles: false})
        target.playSound('random.hurt');
        target.applyDamage(0.001, {cause: EntityDamageCause.override});
        attacker.playSound('random.orb');
    }

    private static isTeamDamage(attacker: Player, target: Player) {
        const attackerTeam = entity_dynamic_property(attacker, 'player:team');
        const targetTeam = entity_dynamic_property(target, 'player:team');
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

// export class DamageSystem {
    
//     readonly attacker: Player;
//     readonly target: Player;
    
//     constructor(attacker: Player, target: Player) {
//         attacker = attacker;
//         target = target;
//     }

//     applyBulletDamage(gunActor: ItemActor, hitHeight: number) {

//         const attackerTeam = entity_dynamic_property(attacker, 'player:team');
//         const targetTeam = entity_dynamic_property(target, 'player:team');
//         if (attackerTeam === targetTeam) return;
        
//         const distance = getDistance() as DamageDistanceType;
//         const hitPart = getHitPart(hitHeight) as BulletHitPartType;

//         attacker.sendMessage(hitPart);
        
//         const damageComp = gunActor.getComponent('gun_damage')!;
//         const damage = damageComp[distance][hitPart];
        
//         if (!target.hasComponent('health')) return;
//         const healthComp = target.getComponent('health')!;
        
//         if (healthComp.currentValue - damage > 0) {
//             healthComp.setCurrentValue(healthComp.currentValue - damage);
//         } else {
//             gameEvents.emit('playerDied', {
//                 attacker: attacker,
//                 deadPlayer: target
//             });
//         }

//         target.playSound('random.hurt');
//         target.applyDamage(0.001, {cause: EntityDamageCause.override});
//         attacker.playSound('random.orb');
//     }

//     private getDistance() {
//         const distance = Vector3Utils.distance(attacker.location, target.location);
//         if (distance <= NEAR_DISTANCE) return 'near';
//         if (distance <= MEDIUM_DISTANCE) return 'medium';
//         return 'far';
//     }

//     private getHitPart(hitHeight: number) {
//         if (!(target instanceof Player)) return 'head';
//         const targetFeetHeight = target.location.y;

//         const height = Math.abs(hitHeight - targetFeetHeight);

//         if (height <= 0.85) return 'legs';
//         if (height <= 1.45) return 'body';
//         return 'head';
//     }

// }