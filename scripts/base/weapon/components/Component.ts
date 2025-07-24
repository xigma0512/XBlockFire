import { GunComponent } from "./gun/GunComponent";
import { GunRecoilComponent } from "./gun/GunRecoilComponent";
import { GunFireComponent } from "./gun/GunFireComponent";
import { GunReloadComponent } from "./gun/GunReloadComponent";
import { GunOffsetComponent } from "./gun/GunOffsetComponent";
import { GunMagazineComponent } from "./gun/GunMagazineComponent";
import { GunDamageComponent } from "./gun/GunDamageComponent";

import { ItemComponent } from "./ItemComponent";
import { ItemWeightComponent } from "./ItemWeightComponent";

import { EntityComponent } from "./EntityComponent";

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
    'item_weight': ItemWeightComponent;
    
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