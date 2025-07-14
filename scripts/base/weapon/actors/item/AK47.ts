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
                    shacking_level: 0.06,
                    shacking_duration: 0.15
                }
            )).set('gun_reload', new GunReloadComponent(
                {
                    reload_time: 45,
                    reload_sound: 'xblockfire.ak47_reload'
                }
            )).set('gun_offset', new GunOffsetComponent({
                scope: 0.2,
                hipfire: 4,
                movement: 9
            }));

        this.setItem();
    }

}