import { GunComponent } from "./gun/GunComponent";
import { GunRecoilComponent } from "./gun/GunAnimationComponent";
import { GunFireComponent } from "./gun/GunFireComponent";
import { GunReloadComponent } from "./gun/GunReloadComponent";
import { EntityComponent } from "./EntityComponent";
import { BulletComponent } from "./BulletComponent";
import { DamageComponent } from "./DamageComponent";
import { ItemComponent } from "./ItemComponent";
import { MagazineComponent } from "./MagazineComponent";

export type ComponentTypes = {
    'gun': GunComponent;
    'gun_fire': GunFireComponent
    'gun_recoil': GunRecoilComponent;
    'gun_reload': GunReloadComponent;
    'damage': DamageComponent;
    'item': ItemComponent;
    'magazine': MagazineComponent;
    'entity': EntityComponent;
    'bullet': BulletComponent;
}

export class Component {
    readonly componentId: keyof ComponentTypes;
    constructor(id: keyof ComponentTypes) {
        this.componentId = id;
    }
}