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

export class SG200 extends ItemActor {

    clone() { return new SG200(); }

    constructor() {
        super('sg200', new ItemStack('xblockfire:sg200', 1));
        
        this.components
            .set('item', new ItemComponent(
                {
                    nametag: 'SG200',
                    lore: [ "I'M A GUN!!!" ],
                    keepOnDeath: true,
                    lockMode: ItemLockMode.slot
                }
            )).set('gun', new GunComponent(
                {
                    gunTypeId: GunTypeEnum.SG200
                }
            )).set('gun_magazine', new GunMagazineComponent(
                {
                    ammo: 10,
                    count: 3
                }
            )).set('gun_fire', new GunFireComponent(
                {
                    fire_mode: FireModeEnum["Semi-Auto"],
                    release_to_fire: false,
                    bullet_spread: 8,
                    fire_rate: 14,
                    fire_sound: 'xblockfire.sg200_fire'
                }
            )).set('gun_recoil', new GunRecoilComponent(
                {
                    shacking_level: 0.12,
                    shacking_duration: 0.2
                }
                )).set('gun_damage', new GunDamageComponent(
                    {
                        near: { head: 5, body: 4, legs: 3 },
                        medium: { head: 2, body: 1, legs: 1 },
                        far: { head: 1, body: 0, legs: 0 }
                    }
                )).set('gun_reload', new GunReloadComponent(
                {
                    reload_time: 40,
                    reload_sound: 'xblockfire.sg200_reload'
                }
            )).set('gun_offset', new GunOffsetComponent({
                scope: 0.05,
                hipfire: 0.08,
                movement: 0.05
            }));

        this.setItem();
    }

}