import { ItemActor } from "../Actor";
import { GunComponent } from "../../components/gun/GunComponent";
import { ItemComponent } from "../../components/ItemComponent";
import { GunMagazineComponent } from "../../components/gun/GunMagazineComponent";
import { FireModeEnum, GunTypeEnum } from "../../../../types/weapon/WeaponEnum";

import { ItemLockMode, ItemStack } from "@minecraft/server";
import { GunFireComponent } from "../../components/gun/GunFireComponent";
import { GunRecoilComponent } from "../../components/gun/GunRecoilComponent";
import { GunReloadComponent } from "../../components/gun/GunReloadComponent";
import { GunOffsetComponent } from "../../components/gun/GunOffsetComponent";
import { GunDamageComponent } from "../../components/gun/GunDamageComponent";

export class Deagle extends ItemActor {

    clone() { return new Deagle(); }

    constructor() {
        super('deagle', new ItemStack('xblockfire:deagle', 1));
        
        this.components
            .set('item', new ItemComponent(
                {
                    nametag: 'Deagle',
                    lore: [ "I'M A GUN!!!" ],
                    keepOnDeath: true,
                    lockMode: ItemLockMode.slot
                }
            )).set('gun', new GunComponent(
                {
                    gunTypeId: GunTypeEnum.Deagle
                }
            )).set('gun_magazine', new GunMagazineComponent(
                {
                    ammo: 7,
                    count: 3
                }
            )).set('gun_fire', new GunFireComponent(
                {
                    fire_mode: FireModeEnum["Semi-Auto"],
                    release_to_fire: false,
                    bullet_spread: 1,
                    fire_rate: 5,
                    fire_sound: "xblockfire.deagle_fire"
                }
            )).set('gun_recoil', new GunRecoilComponent(
                {
                    shacking_level: 0.09,
                    shacking_duration: 0.12
                }
            )).set('gun_damage', new GunDamageComponent(
                {
                    near: { head: 16, body: 8, legs: 6 },
                    medium: { head: 13, body: 6, legs: 4 },
                    far: { head: 8, body: 4, legs: 3 }
                }
            )).set('gun_reload', new GunReloadComponent(
                {
                    reload_time: 36,
                    reload_sound: "xblockfire.deagle_reload"
                }
            )).set('gun_offset', new GunOffsetComponent({
                scope: 0.001,
                hipfire: 0.007,
                movement: 0.01
            }));

        this.setItem();
    }

}