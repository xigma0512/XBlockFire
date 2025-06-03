import { GrenadeTypeEnum } from "../types/Enums";
import { Component } from "./Component";

type ComponentDataType = {
    grenadeTypeId: GrenadeTypeEnum;
    executeDelay: number;
}

export class GrenadeComponent extends Component {
    
    readonly grenadeTypeId: GrenadeTypeEnum;
    readonly executeDelay: number;

    constructor(data: ComponentDataType) {
        super('grenade');

        this.grenadeTypeId = data.grenadeTypeId;
        this.executeDelay = data.executeDelay;
    }

}