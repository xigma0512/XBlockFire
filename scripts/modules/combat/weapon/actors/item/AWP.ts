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

export class AWP extends ItemActor {
    clone() {
        return new AWP();
    }

    constructor() {
        super('awp', new ItemStack('minecraft:spyglass', 1));

        this.components
            .set(
                'item',
                new ItemComponent({
                    nametag: 'AWP',
                    lore: ["I'M A GUN!!!"],
                    keepOnDeath: true,
                    lockMode: ItemLockMode.slot,
                })
            )
            .set(
                'item_weight',
                new ItemWeightComponent({
                    weight: 0.08,
                })
            )
            .set(
                'gun',
                new GunComponent({
                    gunTypeId: GunTypeEnum.AWP,
                })
            )
            .set(
                'gun_raise',
                new GunRaiseComponent({
                    raise_time: 15,
                })
            )
            .set(
                'gun_magazine',
                new GunMagazineComponent({
                    ammo: 5,
                    count: 5,
                })
            )
            .set(
                'gun_fire',
                new GunFireComponent({
                    fire_mode: FireModeEnum['Semi-Auto'],
                    release_to_fire: true,
                    bullet_spread: 1,
                    fire_rate: 20,
                    fire_sound: 'xblockfire.awp_fire',
                })
            )
            .set(
                'gun_recoil',
                new GunRecoilComponent({
                    scope_recoil: { level: 0.06, duration: 0.2 },
                    hipfire_recoil: { level: 0.1, duration: 0.2 },
                })
            )
            .set(
                'gun_damage',
                new GunDamageComponent({
                    near: { head: 100, body: 58, legs: 45 },
                    medium: { head: 100, body: 58, legs: 43 },
                    far: { head: 100, body: 58, legs: 40 },
                })
            )
            .set(
                'gun_reload',
                new GunReloadComponent({
                    reload_time: 60,
                    reload_sound: 'xblockfire.awp_reload',
                })
            )
            .set(
                'gun_offset',
                new GunOffsetComponent({
                    scope: 0,
                    hipfire: 0.008,
                    movement: 0.5,
                })
            );

        this.setItem();
    }
}
