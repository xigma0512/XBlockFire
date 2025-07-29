import { ItemActor } from "../Actor";

import { ItemComponent } from "../../components/ItemComponent";
import { ItemWeightComponent } from "../../components/ItemWeightComponent";

import { GunComponent } from "../../components/gun/GunComponent";
import { GunFireComponent } from "../../components/gun/GunFireComponent";
import { GunMagazineComponent } from "../../components/gun/GunMagazineComponent";
import { GunRecoilComponent } from "../../components/gun/GunRecoilComponent";
import { GunReloadComponent } from "../../components/gun/GunReloadComponent";
import { GunOffsetComponent } from "../../components/gun/GunOffsetComponent";
import { GunDamageComponent } from "../../components/gun/GunDamageComponent";

import { FireModeEnum, GunTypeEnum } from "../../../../shared/types/weapon/WeaponEnum";
import { ItemLockMode, ItemStack } from "@minecraft/server";

export class AK47 extends ItemActor {

    clone() { return new AK47(); }

    constructor() {
        super('ak47', new ItemStack('xblockfire:ak47', 1));
        
        this.components
            .set('item', new ItemComponent(
                {
                    nametag: 'AK47',
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
                    gunTypeId: GunTypeEnum.AK47
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
                    fire_rate: 3,
                    fire_sound: 'xblockfire.ak47_fire'
                }
            )).set('gun_recoil', new GunRecoilComponent(
                {
                    scope_recoil: { level: 0.02, duration: 0.2 },
                    hipfire_recoil: { level: 0.06, duration: 0.2 }
                }
            )).set('gun_damage', new GunDamageComponent(
                {
                    near: { head: 14, body: 11, legs: 9 },
                    medium: { head: 12, body: 10, legs: 8 },
                    far: { head: 10, body: 8, legs: 6 }
                }
            )).set('gun_reload', new GunReloadComponent(
                {
                    reload_time: 45,
                    reload_sound: 'xblockfire.ak47_reload'
                }
            )).set('gun_offset', new GunOffsetComponent(
                {
                    scope: 0.001,
                    hipfire: 0.03,
                    movement: 0.03
                }
            ));

        this.setItem();
    }

}