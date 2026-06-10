import { EntityActor } from '../../../actors/Actor';
import { ExplosionSystem } from '../../../../explosion/ExplosionSystem';
import { GrenadeHandler } from './GrenadeHandler';

import { system } from '@minecraft/server';

const FRAGMENTATION_EXPLOSION_RADIUS = 7.5;
const FRAGMENTATION_MAX_DAMAGE = 40;
const FRAGMENTATION_MIN_DAMAGE = 4;

export class FragmentationHandler extends GrenadeHandler {
    constructor(actor: EntityActor) {
        super(actor);

        const grenadeComp = actor.getComponent('grenade')!;
        system.runTimeout(() => this.execute(), grenadeComp.executeDelay);
    }

    execute() {
        const entity = this.entityActor.entity;
        ExplosionSystem.explode({
            dimension: entity.dimension,
            location: entity.location,
            radius: FRAGMENTATION_EXPLOSION_RADIUS,
            maxDamage: FRAGMENTATION_MAX_DAMAGE,
            minDamage: FRAGMENTATION_MIN_DAMAGE,
            source: entity,
            soundId: 'C4_EXPLOSION',
            soundVolume: 3,
            particleType: 'minecraft:huge_explosion_emitter',
            particleCount: 3,
            obstacleBlocked: true,
        });

        super.execute();
    }
}
