import { EntityActor } from "../../actors/Actor";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../../../utils/Property";

import { Vector3Utils } from "@minecraft/math";
import { Entity, GameMode, Player, Vector3 } from "@minecraft/server";

const NEAR_DISTANCE = 15;
const MEDIUM_DISTANCE = 45;

export class DamageSystem {
    
    readonly attacker: Player;
    readonly target: Entity;
    
    constructor(attacker: Player, target: Entity) {
        this.attacker = attacker;
        this.target = target;
    }

    applyBulletDamage(bulletActor: EntityActor, hitLocation: Vector3) {

        if (this.target instanceof Player) {
            const attackerTeam = entity_dynamic_property(this.attacker, 'player:team');
            const targetTeam = entity_dynamic_property(this.target, 'player:team');
            if (attackerTeam === targetTeam) return;
        }
        
        const distance = this.getDistance() as DamageDistanceType;
        const hitPart = this.getHitPart(hitLocation) as BulletHitPartType;
        
        const damageComp = bulletActor.getComponent('bullet_damage')!;
        const damage = damageComp[distance][hitPart];
        
        const healthComp = this.target.getComponent('health');
        if (healthComp === undefined) return;
        if (healthComp.currentValue - damage > 0) {
            healthComp.setCurrentValue(healthComp.currentValue - damage);
        } else {
            playerDead(this.target);
        }

        this.attacker.playSound('game.player.hurt');
        if (this.target instanceof Player) this.target.playSound('random.hurt');
    }

    private getDistance() {
        const distance = Vector3Utils.distance(this.attacker.location, this.target.location);
        if (distance <= NEAR_DISTANCE) return 'near';
        if (distance <= MEDIUM_DISTANCE) return 'medium';
        return 'far';
    }

    private getHitPart(hitLocation: Vector3) {
        if (!(this.target instanceof Player)) return 'head';
        const targetFeetHeight = this.target.location.y;

        const height = Math.abs(hitLocation.y - targetFeetHeight);

        if (height <= 0.85) return 'legs';
        if (height <= 1.45) return 'body';
        return 'head';
    }

}

function playerDead(entity: Player | Entity) {
    if (entity instanceof Player) {   
        entity.setGameMode(GameMode.spectator);
        set_entity_dynamic_property(entity, 'player:is_alive', false);
        entity.sendMessage('you dead');
    }
    else {
        entity.kill();
    }
}