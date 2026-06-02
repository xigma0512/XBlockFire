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

import { FireModeEnum, GunTypeEnum } from '../../WeaponEnum';
import { ItemLockMode, ItemStack } from '@minecraft/server';

export class P90 extends ItemActor {
    clone() {
        return new P90();
    }

    constructor() {
        super('p90', new ItemStack('xblockfire:p90', 1));

        this.components
            .set(
                'item',
                new ItemComponent({
                    nametag: 'P90',
                    lore: ["I'M A GUN!!!"],
                    keepOnDeath: true,
                    lockMode: ItemLockMode.slot,
                })
            )
            .set(
                'item_weight',
                new ItemWeightComponent({
                    weight: 0.115,
                })
            )
            .set(
                'gun_magazine',
                new GunMagazineComponent({
                    ammo: 50,
                    count: 5,
                })
            )
            .set(
                'gun',
                new GunComponent({
                    gunTypeId: GunTypeEnum.P90,
                })
            )
            .set(
                'gun_fire',
                new GunFireComponent({
                    fire_mode: FireModeEnum['Fully-Auto'],
                    release_to_fire: false,
                    bullet_spread: 1,
                    fire_rate: 2,
                    fire_sound: 'xblockfire.p90_fire',
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
                    near: { head: 7, body: 6, legs: 5 },
                    medium: { head: 5, body: 5, legs: 4 },
                    far: { head: 3, body: 3, legs: 2 },
                })
            )
            .set(
                'gun_reload',
                new GunReloadComponent({
                    reload_time: 50,
                    reload_sound: 'xblockfire.p90_reload',
                })
            )
            .set(
                'gun_offset',
                new GunOffsetComponent({
                    scope: 0.008,
                    hipfire: 0.02,
                    movement: 0.008,
                })
            );

        this.setItem();
    }
}
