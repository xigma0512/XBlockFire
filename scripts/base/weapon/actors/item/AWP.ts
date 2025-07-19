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
                    shacking_level: 0.11,
                    shacking_duration: 0.15
                }
            )).set('gun_damage', new GunDamageComponent(
                {
                    near: { head: 20, body: 20, legs: 18 },
                    medium: { head: 20, body: 20, legs: 16 },
                    far: { head: 20, body: 20, legs: 14 }
                }
            )).set('gun_reload', new GunReloadComponent(
                {
                    reload_time: 60,
                    reload_sound: 'xblockfire.awp_reload'
                }
            )).set('gun_offset', new GunOffsetComponent({
                scope: 0.1,
                hipfire: 1,
                movement: 12
            }));

        this.setItem();
    }

}