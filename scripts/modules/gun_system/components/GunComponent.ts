import { Component } from "./Component";

type ComponentDataType = {
    fire_mode: FireModeEnum;
    release_to_fire: boolean; 

    bullet_spread: number;
    fire_rate: number;

    shacking_level: number;
    shacking_duration: number;

    reload_time: number;
}

export class GunComponent extends Component {
    
    readonly fire_mode: FireModeEnum;
    readonly release_to_fire: boolean; 

    readonly bullet_spread: number;
    readonly fire_rate: number;

    readonly shacking_level: number;
    readonly shacking_duration: number;

    readonly reload_time: number;

    constructor(data: ComponentDataType) {
        super('gun');

        this.fire_mode = data.fire_mode;
        this.release_to_fire = data.release_to_fire;
        this.bullet_spread = data.bullet_spread;
        this.fire_rate = data.fire_rate;
        this.shacking_level = data.shacking_level;
        this.shacking_duration = data.shacking_duration;
        this.reload_time = data?.reload_time;
    }

}