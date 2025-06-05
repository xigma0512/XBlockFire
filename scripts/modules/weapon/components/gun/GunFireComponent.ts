import { FireModeEnum } from "../../types/Enums";
import { Component } from "../Component";

type ComponentDataType = {
    fire_mode: FireModeEnum;
    release_to_fire: boolean;
    bullet_spread: number;
    fire_rate: number;
}

export class GunFireComponent extends Component {
    readonly fire_mode: FireModeEnum;
    readonly release_to_fire: boolean;
    readonly bullet_spread: number;
    readonly fire_rate: number;

    constructor(data: ComponentDataType) {
        super('gun_fire');
        
        this.fire_mode = data.fire_mode;
        this.release_to_fire = data.release_to_fire;
        this.bullet_spread = data.bullet_spread;
        this.fire_rate = data.fire_rate;
    }
}