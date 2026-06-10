import { AreaEffectSystem } from '../../../../area_effect/AreaEffectSystem';
import { EntityActor } from '../../../actors/Actor';
import { GrenadeHandler } from './GrenadeHandler';

export class IncendiaryGrenadeHandler extends GrenadeHandler {
    private hasTriggered: boolean = false;

    constructor(actor: EntityActor) {
        super(actor);
    }

    trigger() {
        if (this.hasTriggered) return;
        this.hasTriggered = true;

        const entity = this.entityActor.entity;

        AreaEffectSystem.createFireArea({
            dimension: entity.dimension,
            origin: entity.location,
            duration: 140, // 7 seconds (7 * 20 ticks)
            radius: 3,
            damageInterval: 10, // 0.5 seconds
            damagePerTick: 5,
        });

        super.execute();
    }
}
