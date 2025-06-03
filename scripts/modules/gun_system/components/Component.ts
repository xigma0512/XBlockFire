import { GunComponent } from "./gun/GunComponent";
import { GunRecoilComponent } from "./gun/GunRecoilComponent";
import { GunFireComponent } from "./gun/GunFireComponent";
import { GunReloadComponent } from "./gun/GunReloadComponent";
import { GunOffsetComponent } from "./gun/GunOffsetComponent";
import { EntityComponent } from "./EntityComponent";
import { BulletComponent } from "./BulletComponent";
import { DamageComponent } from "./DamageComponent";
import { ItemComponent } from "./ItemComponent";
import { MagazineComponent } from "./MagazineComponent";
import { ProjectileReboundComponent } from "./ProjectileReboundComponent";

export type ComponentTypes = {
    'gun': GunComponent;
    'gun_fire': GunFireComponent
    'gun_recoil': GunRecoilComponent;
    'gun_reload': GunReloadComponent;
    'gun_offset': GunOffsetComponent
    'damage': DamageComponent;
    'item': ItemComponent;
    'magazine': MagazineComponent;
    'entity': EntityComponent;
    'bullet': BulletComponent;
    'projectile_rebound': ProjectileReboundComponent;
}

export class Component {
    readonly componentId: keyof ComponentTypes;
    constructor(id: keyof ComponentTypes) {
        this.componentId = id;
    }
}