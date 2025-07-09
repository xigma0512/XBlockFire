import { GrenadeTypeEnum } from "../../../types/weapon/WeaponEnum";
import { Component } from "./Component";

type ComponentDataType = {
    grenadeTypeId: GrenadeTypeEnum;
    executeDelay: number;

    throwing_sound?: string;
    explode_sound?: string;
}

export class GrenadeComponent extends Component {
    
    readonly grenadeTypeId: GrenadeTypeEnum;
    readonly executeDelay: number;

    readonly throwing_sound?: string;
    readonly explode_sound?: string;

    constructor(data: ComponentDataType) {
        super('grenade');

        this.grenadeTypeId = data.grenadeTypeId;
        this.executeDelay = data.executeDelay;
        
        this.throwing_sound = data.throwing_sound;
        this.explode_sound = data.explode_sound;
    }

}