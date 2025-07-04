import { GunTypeEnum } from "../../../../types/weapon/WeaponEnum";
import { Component } from "../Component";

type ComponentDataType = {
    gunTypeId: GunTypeEnum;
}

export class GunComponent extends Component {
    
    readonly gunTypeId: GunTypeEnum;

    constructor(data: ComponentDataType) {
        super('gun');

        this.gunTypeId = data.gunTypeId;
    }

}