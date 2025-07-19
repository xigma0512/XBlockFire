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
                    shacking_level: 0.01,
                    shacking_duration: 0.12
                }
            )).set('gun_damage', new GunDamageComponent(
                {
                    near: { head: 1, body: 1, legs: 1 },
                    medium: { head: 1, body: 1, legs: 1 },
                    far: { head: 1, body: 1, legs: 1 }
                }
            )).set('gun_reload', new GunReloadComponent(
                {
                    reload_time: 25,
                    reload_sound: "xblockfire.glock17_reload"
                }
            )).set('gun_offset', new GunOffsetComponent({
                scope: 0,
                hipfire: 1,
                movement: 2
            }));

        this.setItem();
    }

}