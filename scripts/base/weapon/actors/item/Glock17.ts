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

import { FireModeEnum, GunTypeEnum } from "../../../../types/weapon/WeaponEnum";
import { ItemLockMode, ItemStack } from "@minecraft/server";

export class Glock17 extends ItemActor {

    clone() { return new Glock17(); }

    constructor() {
        super('glock17', new ItemStack('xblockfire:glock17', 1));
        
        this.components
            .set('item', new ItemComponent(
                {
                    nametag: 'Glock17',
                    lore: [ "I'M A GUN!!!" ],
                    keepOnDeath: true,
                    lockMode: ItemLockMode.slot
                }
            )).set('item_weight', new ItemWeightComponent(
                {
                    weight: 0.105
                }
            )).set('gun', new GunComponent(
                {
                    gunTypeId: GunTypeEnum.Glock17
                }
            )).set('gun_magazine', new GunMagazineComponent(
                {
                    ammo: 12,
                    count: 3
                }
            )).set('gun_fire', new GunFireComponent(
                {
                    fire_mode: FireModeEnum['Semi-Auto'],
                    release_to_fire: false,
                    bullet_spread: 1,
                    fire_rate: 2,
                    fire_sound: "xblockfire.glock17_fire"
                }
            )).set('gun_recoil', new GunRecoilComponent(
                {
                    scope_recoil: { level: 0.02, duration: 0.2 },
                    hipfire_recoil: { level: 0.04, duration: 0.2 }
                }
            )).set('gun_damage', new GunDamageComponent(
                {
                    near: { head: 10, body: 5, legs: 3 },
                    medium: { head: 8, body: 4, legs: 2 },
                    far: { head: 6, body: 3, legs: 1 }
                }
            )).set('gun_reload', new GunReloadComponent(
                {
                    reload_time: 25,
                    reload_sound: "xblockfire.glock17_reload"
                }
            )).set('gun_offset', new GunOffsetComponent({
                scope: 0,
                hipfire: 0.005,
                movement: 0.005
            }));

        this.setItem();
    }

}