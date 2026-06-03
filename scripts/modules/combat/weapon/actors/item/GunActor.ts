import { ItemStack } from '@minecraft/server';
import { ItemActor } from '../Actor';
import { ItemComponent } from '../../components/ItemComponent';
import { ItemWeightComponent } from '../../components/ItemWeightComponent';
import { GunComponent } from '../../components/gun/GunComponent';
import { GunDamageComponent } from '../../components/gun/GunDamageComponent';
import { GunFireComponent } from '../../components/gun/GunFireComponent';
import { GunMagazineComponent } from '../../components/gun/GunMagazineComponent';
import { GunOffsetComponent } from '../../components/gun/GunOffsetComponent';
import { GunRaiseComponent } from '../../components/gun/GunRaiseComponent';
import { GunRecoilComponent } from '../../components/gun/GunRecoilComponent';
import { GunReloadComponent } from '../../components/gun/GunReloadComponent';
import { GunConfigType } from '../../config/gun/GunConfigType';

export abstract class GunActor extends ItemActor {
    constructor(config: GunConfigType) {
        super(config.id, new ItemStack(config.itemTypeId, 1));

        this.components
            .set('item', new ItemComponent(config.item))
            .set('item_weight', new ItemWeightComponent({ weight: config.weight }))
            .set('gun', new GunComponent({ gunTypeId: config.gunTypeId }))
            .set('gun_raise', new GunRaiseComponent({ raise_time: config.raiseTime }))
            .set('gun_magazine', new GunMagazineComponent(config.magazine))
            .set(
                'gun_fire',
                new GunFireComponent({
                    fire_mode: config.fire.mode,
                    release_to_fire: config.fire.releaseToFire,
                    bullet_spread: config.fire.bulletSpread,
                    fire_rate: config.fire.rate,
                })
            )
            .set(
                'gun_recoil',
                new GunRecoilComponent({
                    scope_recoil: config.recoil.scope,
                    hipfire_recoil: config.recoil.hipfire,
                })
            )
            .set('gun_damage', new GunDamageComponent(config.damage))
            .set(
                'gun_reload',
                new GunReloadComponent({
                    reload_time: config.reload.time,
                })
            )
            .set('gun_offset', new GunOffsetComponent(config.offset));

        this.setItem();
    }
}
