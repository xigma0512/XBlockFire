import { Entity } from '@minecraft/server';

import { entity_native_property } from '../../../../../../utils/Property';
import { EntityActor } from '../../Actor';
import { GrenadeComponent } from '../../../components/GrenadeComponent';
import { ProjectileReboundComponent } from '../../../components/ProjectileReboundComponent';
import { GrenadeTypeEnum } from '../../../WeaponEnum';

export class Fragmentation extends EntityActor {
    constructor(entity: Entity) {
        super('fragmentation', entity);

        const throwingType = entity_native_property(entity, 'grenade:throwing_type');
        this.components
            .set(
                'projectile_rebound',
                new ProjectileReboundComponent({
                    bounceFactor: throwingType === 0 ? 0.6 : 0.2,
                })
            )
            .set(
                'grenade',
                new GrenadeComponent({
                    grenadeTypeId: GrenadeTypeEnum.Fragmentation,
                    executeDelay: throwingType === 0 ? 40 : 20,
                    throwing_sound: 'xblockfire.throwing_frag',
                    explode_sound: 'xblockfire.frag_explode',
                    bounce_sound: 'xblockfire.frag_bounce',
                })
            );
    }
}
