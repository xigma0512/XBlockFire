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

export class P90 extends ItemActor {

    clone() { return new P90(); }

    constructor() {
        super('p90', new ItemStack('xblockfire:p90', 1));
        
        this.components
            .set('item', new ItemComponent(
                {
                    nametag: 'P90',
                    lore: [ "I'M A GUN!!!" ],
                    keepOnDeath: true,
                    lockMode: ItemLockMode.slot
                }
            )).set('gun', new GunComponent(
                {
                    gunTypeId: GunTypeEnum.P90
                }
            )).set('gun_magazine', new GunMagazineComponent(
                {
                    ammo: 50,
                    count: 3
                }
            )).set('gun_fire', new GunFireComponent(
                {
                    fire_mode: FireModeEnum["Fully-Auto"],
                    release_to_fire: false,
                    bullet_spread: 1,
                    fire_rate: 2,
                    fire_sound: 'xblockfire.p90_fire'
                }
            )).set('gun_recoil', new GunRecoilComponent(
                {
                    shacking_level: 0.02,
                    shacking_duration: 0.15
                }
                )).set('gun_damage', new GunDamageComponent(
                    {
                        near: { head: 6, body: 5, legs: 4 },
                        medium: { head: 4, body: 3, legs: 2 },
                        far: { head: 2, body: 1, legs: 0 }
                    }
                )).set('gun_reload', new GunReloadComponent(
                {
                    reload_time: 50,
                    reload_sound: 'xblockfire.p90_reload'
                }
            )).set('gun_offset', new GunOffsetComponent({
                scope: 0.01,
                hipfire: 0.04,
                movement: 0.05
            }));

        this.setItem();
    }

}