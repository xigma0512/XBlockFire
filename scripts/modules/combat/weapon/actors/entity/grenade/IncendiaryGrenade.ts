import { Entity } from '@minecraft/server';

import { entity_native_property } from '../../../../../../utils/Property';
import { GrenadeComponent } from '../../../components/GrenadeComponent';
import { ProjectileReboundComponent } from '../../../components/ProjectileReboundComponent';
import { GrenadeTypeEnum } from '../../../WeaponEnum';
import { EntityActor } from '../../Actor';

export class IncendiaryGrenade extends EntityActor {
    constructor(entity: Entity) {
        super('incendiary_grenade', entity);

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
                    grenadeTypeId: GrenadeTypeEnum.IncendiaryGrenade,
                    executeDelay: 0,
                    throwing_sound: 'xblockfire.throwing_inc',
                    explode_sound: 'xblockfire.inc_explode',
                    bounce_sound: 'xblockfire.inc_bounce',
                })
            );
    }
}
