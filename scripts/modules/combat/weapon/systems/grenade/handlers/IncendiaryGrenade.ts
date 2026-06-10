import { AreaEffectSystem } from '../../../../area_effect/AreaEffectSystem';
import type { FirePoint } from '../../../../area_effect/AreaEffectSystem';
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
        const location = entity.location;

        const points: FirePoint[] = [
            { location: { x: location.x, y: location.y, z: location.z }, radius: 1.5 },
            { location: { x: location.x + 1, y: location.y, z: location.z }, radius: 1.5 },
            { location: { x: location.x - 1, y: location.y, z: location.z }, radius: 1.5 },
            { location: { x: location.x, y: location.y, z: location.z + 1 }, radius: 1.5 },
            { location: { x: location.x, y: location.y, z: location.z - 1 }, radius: 1.5 },
        ];

        AreaEffectSystem.createFireArea({
            dimension: entity.dimension,
            origin: location,
            duration: 140, // 7 seconds (7 * 20 ticks)
            damageInterval: 10, // 0.5 seconds
            damagePerTick: 5,
            points: points,
        });

        super.execute();
    }
}
