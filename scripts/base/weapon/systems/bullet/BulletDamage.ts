import { gameEvents } from "../../../../event/EventEmitter";

import { ItemActor } from "../../actors/Actor";

import { entity_dynamic_property } from "../../../../utils/Property";

import { Vector3Utils } from "@minecraft/math";
import { EntityDamageCause, Player } from "@minecraft/server";

const NEAR_DISTANCE = 10;
const MEDIUM_DISTANCE = 30;

export class DamageSystem {
    
    readonly attacker: Player;
    readonly target: Player;
    
    constructor(attacker: Player, target: Player) {
        this.attacker = attacker;
        this.target = target;
    }

    applyBulletDamage(gunActor: ItemActor, hitHeight: number) {

        const attackerTeam = entity_dynamic_property(this.attacker, 'player:team');
        const targetTeam = entity_dynamic_property(this.target, 'player:team');
        if (attackerTeam === targetTeam) return;
        
        const distance = this.getDistance() as DamageDistanceType;
        const hitPart = this.getHitPart(hitHeight) as BulletHitPartType;

        this.attacker.sendMessage(hitPart);
        
        const damageComp = gunActor.getComponent('gun_damage')!;
        const damage = damageComp[distance][hitPart];
        
        if (!this.target.hasComponent('health')) return;
        const healthComp = this.target.getComponent('health')!;
        
        if (healthComp.currentValue - damage > 0) {
            healthComp.setCurrentValue(healthComp.currentValue - damage);
        } else {
            gameEvents.emit('playerDied', {
                attacker: this.attacker,
                deadPlayer: this.target
            });
        }

        this.target.playSound('random.hurt');
        this.target.applyDamage(0.001, {cause: EntityDamageCause.override});
        this.attacker.playSound('random.orb');
    }

    private getDistance() {
        const distance = Vector3Utils.distance(this.attacker.location, this.target.location);
        if (distance <= NEAR_DISTANCE) return 'near';
        if (distance <= MEDIUM_DISTANCE) return 'medium';
        return 'far';
    }

    private getHitPart(hitHeight: number) {
        if (!(this.target instanceof Player)) return 'head';
        const targetFeetHeight = this.target.location.y;

        const height = Math.abs(hitHeight - targetFeetHeight);

        if (height <= 0.85) return 'legs';
        if (height <= 1.45) return 'body';
        return 'head';
    }

}