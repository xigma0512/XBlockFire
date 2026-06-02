import { ItemActor } from '../Actor';

import { ItemComponent } from '../../components/ItemComponent';
import { ItemWeightComponent } from '../../components/ItemWeightComponent';

import { GunComponent } from '../../components/gun/GunComponent';
import { GunMagazineComponent } from '../../components/gun/GunMagazineComponent';
import { GunFireComponent } from '../../components/gun/GunFireComponent';
import { GunRecoilComponent } from '../../components/gun/GunRecoilComponent';
import { GunReloadComponent } from '../../components/gun/GunReloadComponent';
import { GunOffsetComponent } from '../../components/gun/GunOffsetComponent';
import { GunDamageComponent } from '../../components/gun/GunDamageComponent';
import { GunRaiseComponent } from '../../components/gun/GunRaiseComponent';

import { FireModeEnum, GunTypeEnum } from '../../WeaponEnum';
import { ItemLockMode, ItemStack } from '@minecraft/server';

export class Deagle extends ItemActor {
    clone() {
        return new Deagle();
    }

    constructor() {
        super('deagle', new ItemStack('xblockfire:deagle', 1));

        this.components
            .set(
                'item',
                new ItemComponent({
                    nametag: 'Deagle',
                    lore: ["I'M A GUN!!!"],
                    keepOnDeath: true,
                    lockMode: ItemLockMode.slot,
                })
            )
            .set(
                'item_weight',
                new ItemWeightComponent({
                    weight: 0.12,
                })
            )
            .set(
                'gun',
                new GunComponent({
                    gunTypeId: GunTypeEnum.Deagle,
                })
            )
            .set(
                'gun_raise',
                new GunRaiseComponent({
                    raise_time: 5,
                })
            )
            .set(
                'gun_magazine',
                new GunMagazineComponent({
                    ammo: 7,
                    count: 5,
                })
            )
            .set(
                'gun_fire',
                new GunFireComponent({
                    fire_mode: FireModeEnum['Semi-Auto'],
                    release_to_fire: false,
                    bullet_spread: 1,
                    fire_rate: 5,
                    fire_sound: 'xblockfire.deagle_fire',
                })
            )
            .set(
                'gun_recoil',
                new GunRecoilComponent({
                    scope_recoil: { level: 0.02, duration: 0.2 },
                    hipfire_recoil: { level: 0.06, duration: 0.2 },
                })
            )
            .set(
                'gun_damage',
                new GunDamageComponent({
                    near: { head: 16, body: 13, legs: 10 },
                    medium: { head: 14, body: 11, legs: 9 },
                    far: { head: 11, body: 9, legs: 7 },
                })
            )
            .set(
                'gun_reload',
                new GunReloadComponent({
                    reload_time: 36,
                    reload_sound: 'xblockfire.deagle_reload',
                })
            )
            .set(
                'gun_offset',
                new GunOffsetComponent({
                    scope: 0.001,
                    hipfire: 0.008,
                    movement: 0.012,
                })
            );

        this.setItem();
    }
}
