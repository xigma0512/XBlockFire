import { GunComponent } from "./gun/GunComponent";
import { GunRecoilComponent } from "./gun/GunRecoilComponent";
import { GunFireComponent } from "./gun/GunFireComponent";
import { GunReloadComponent } from "./gun/GunReloadComponent";
import { GunOffsetComponent } from "./gun/GunOffsetComponent";
import { GunMagazineComponent } from "./gun/GunMagazineComponent";
import { GunDamageComponent } from "./gun/GunDamageComponent";

import { EntityComponent } from "./EntityComponent";
import { ItemComponent } from "./ItemComponent";
import { ProjectileReboundComponent } from "./ProjectileReboundComponent";
import { GrenadeComponent } from "./GrenadeComponent";

export type ComponentTypes = {
    'gun': GunComponent;
    'gun_fire': GunFireComponent
    'gun_recoil': GunRecoilComponent;
    'gun_reload': GunReloadComponent;
    'gun_offset': GunOffsetComponent
    'gun_magazine': GunMagazineComponent;
    'gun_damage': GunDamageComponent;

    'item': ItemComponent;
    'entity': EntityComponent;
    'projectile_rebound': ProjectileReboundComponent;
    'grenade': GrenadeComponent;
}

export class Component {
    readonly componentId: keyof ComponentTypes;
    constructor(id: keyof ComponentTypes) {
        this.componentId = id;
    }
}