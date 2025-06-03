import { EntityComponent } from "./EntityComponent";
import { BulletComponent } from "./BulletComponent";
import { DamageComponent } from "./DamageComponent";
import { GunComponent } from "./GunComponent";
import { ItemComponent } from "./ItemComponent";
import { MagazineComponent } from "./MagazineComponent";

export type ComponentTypes = {
    'damage': DamageComponent;
    'gun': GunComponent;
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