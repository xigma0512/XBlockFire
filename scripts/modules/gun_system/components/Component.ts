import { DamageComponent } from "./DamageComponent";
import { GunComponent } from "./GunComponent";
import { ItemComponent } from "./ItemComponent";

export type ComponentTypes = {
    'damage': DamageComponent;
    'gun': GunComponent;
    'item': ItemComponent;
}

export class Component {
    readonly componentId: keyof ComponentTypes;
    constructor(id: keyof ComponentTypes) {
        this.componentId = id;
    }
}