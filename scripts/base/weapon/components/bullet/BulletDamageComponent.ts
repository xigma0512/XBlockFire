import { Component } from "../Component";

type ComponentDataType = {
    near: IDamageTable,
    medium: IDamageTable,
    far: IDamageTable
}

export class BulletDamageComponent extends Component {
    
    readonly near: IDamageTable;
    readonly medium: IDamageTable;
    readonly far: IDamageTable;

    constructor(data: ComponentDataType) {
        super('bullet_damage');

        this.near = data.near;
        this.medium = data.medium;
        this.far = data.far;
    }

}