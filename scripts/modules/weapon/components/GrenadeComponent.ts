import { GrenadeTypeEnum } from "../types/Enums";
import { Component } from "./Component";

type ComponentDataType = {
    grenadeTypeId: GrenadeTypeEnum;
    executeDelay: number;
    executeEvent?: string[];
}

export class GrenadeComponent extends Component {
    
    readonly grenadeTypeId: GrenadeTypeEnum;
    readonly executeDelay: number;
    readonly executeEvent?: string[];

    constructor(data: ComponentDataType) {
        super('grenade');

        this.grenadeTypeId = data.grenadeTypeId;
        this.executeDelay = data.executeDelay;
        this.executeEvent = data.executeEvent;
    }

}