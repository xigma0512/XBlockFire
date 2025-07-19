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
                    shacking_level: 0.05,
                    shacking_duration: 0.15
                }
            )).set('gun_damage', new GunDamageComponent(
                {
                    near: { head: 1, body: 1, legs: 1 },
                    medium: { head: 1, body: 1, legs: 1 },
                    far: { head: 1, body: 1, legs: 1 }
                }
            )).set('gun_reload', new GunReloadComponent(
                {
                    reload_time: 40,
                    reload_sound: 'xblockfire.m4a4_reload'
                }
            )).set('gun_offset', new GunOffsetComponent({
                scope: 0.01,
                hipfire: 0.05,
                movement: 0.05
            }));

        this.setItem();
    }

}