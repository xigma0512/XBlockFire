import { ItemActor } from "../Actor";

import { ItemComponent } from "../../components/ItemComponent";
import { ItemWeightComponent } from "../../components/ItemWeightComponent";

import { GunComponent } from "../../components/gun/GunComponent";
import { GunMagazineComponent } from "../../components/gun/GunMagazineComponent";
import { GunFireComponent } from "../../components/gun/GunFireComponent";
import { GunRecoilComponent } from "../../components/gun/GunRecoilComponent";
import { GunReloadComponent } from "../../components/gun/GunReloadComponent";
import { GunOffsetComponent } from "../../components/gun/GunOffsetComponent";
import { GunDamageComponent } from "../../components/gun/GunDamageComponent";

import { FireModeEnum, GunTypeEnum } from "../../../../declarations/enum/WeaponEnum";
import { ItemLockMode, ItemStack } from "@minecraft/server";

export class M4A4 extends ItemActor {

    clone() { return new M4A4(); }

    constructor() {
        super('m4a4', new ItemStack('xblockfire:m4a4', 1));
        
        this.components
            .set('item', new ItemComponent(
                {
                    nametag: 'M4A4',
                    lore: [ "I'M A GUN!!!" ],
                    keepOnDeath: true,
                    lockMode: ItemLockMode.slot
                }
            )).set('item_weight', new ItemWeightComponent(
                {
                    weight: 0.09
                }
            )).set('gun', new GunComponent(
                {
                    gunTypeId: GunTypeEnum.M4A4
                }
            )).set('gun_magazine', new GunMagazineComponent(
                {
                    ammo: 30,
                    count: 3
                }
            )).set('gun_fire', new GunFireComponent(
                {
                    fire_mode: FireModeEnum["Fully-Auto"],
                    release_to_fire: false,
                    bullet_spread: 1,
                    fire_rate: 2,
                    fire_sound: 'xblockfire.m4a4_fire'
                }
            )).set('gun_recoil', new GunRecoilComponent(
                {
                    scope_recoil: { level: 0.02, duration: 0.2 },
                    hipfire_recoil: { level: 0.06, duration: 0.2 }
                }
            )).set('gun_damage', new GunDamageComponent(
                {
                    near: { head: 12, body: 8, legs: 6 },
                    medium: { head: 10, body: 7, legs: 4 },
                    far: { head: 7, body: 4, legs: 3 }
                }
            )).set('gun_reload', new GunReloadComponent(
                {
                    reload_time: 40,
                    reload_sound: 'xblockfire.m4a4_reload'
                }
            )).set('gun_offset', new GunOffsetComponent({
                scope: 0.001,
                hipfire: 0.03,
                movement: 0.02
            }));

        this.setItem();
    }

}