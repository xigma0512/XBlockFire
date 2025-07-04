import { Component } from "../Component";

type ComponentDataType = {
    ammo: number,
    count: number;
}

export class GunMagazineComponent extends Component {

    ammo: number;
    storageAmmo: number;
    readonly capacity: number;

    constructor(data: ComponentDataType) {
        super('gun_magazine');

        this.ammo = data.ammo;
        this.capacity = this.ammo;
        this.storageAmmo = this.ammo * data.count; 
    }
}