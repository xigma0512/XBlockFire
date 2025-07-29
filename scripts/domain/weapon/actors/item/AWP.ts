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

export class AWP extends ItemActor {

    clone() { return new AWP(); }

    constructor() {
        super('awp', new ItemStack('minecraft:spyglass', 1));
        
        this.components
            .set('item', new ItemComponent(
                {
                    nametag: 'AWP',
                    lore: [ "I'M A GUN!!!" ],
                    keepOnDeath: true,
                    lockMode: ItemLockMode.slot
                }
            )).set('item_weight', new ItemWeightComponent(
                {
                    weight: 0.085
                }
            )).set('gun', new GunComponent(
                {
                    gunTypeId: GunTypeEnum.AWP
                }
            )).set('gun_magazine', new GunMagazineComponent(
                {
                    ammo: 5,
                    count: 3
                }
            )).set('gun_fire', new GunFireComponent(
                {
                    fire_mode: FireModeEnum["Semi-Auto"],
                    release_to_fire: true,
                    bullet_spread: 1,
                    fire_rate: 20,
                    fire_sound: 'xblockfire.awp_fire'
                }
            )).set('gun_recoil', new GunRecoilComponent(
                {
                    scope_recoil: { level: 0.06, duration: 0.2 },
                    hipfire_recoil: { level: 0.1, duration: 0.2 }
                }
            )).set('gun_damage', new GunDamageComponent(
                {
                    near: { head: 200, body: 200, legs: 30 },
                    medium: { head: 200, body: 200, legs: 30 },
                    far: { head: 200, body: 200, legs: 25 }
                }
            )).set('gun_reload', new GunReloadComponent(
                {
                    reload_time: 60,
                    reload_sound: 'xblockfire.awp_reload'
                }
            )).set('gun_offset', new GunOffsetComponent({
                scope: 0,
                hipfire: 0.005,
                movement: 0.5
            }));

        this.setItem();
    }

}