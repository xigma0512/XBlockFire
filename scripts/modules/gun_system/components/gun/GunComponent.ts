import { FireModeEnum, GunTypeEnum } from "../../types/Enums";
import { Component } from "../Component";

type ComponentDataType = {
    gunTypeEnum: GunTypeEnum;
}

export class GunComponent extends Component {
    
    readonly gunTypeId: GunTypeEnum;

    constructor(data: ComponentDataType) {
        super('gun');

        this.gunTypeId = data.gunTypeEnum;
    }

}