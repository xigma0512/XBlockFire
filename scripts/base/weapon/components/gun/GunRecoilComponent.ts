import { Component } from "../Component";

type ComponentDataType = {
    shacking_level: number;
    shacking_duration: number;
}

export class GunRecoilComponent extends Component {

    readonly shacking_level: number;
    readonly shacking_duration: number;

    constructor(data: ComponentDataType) {
        super('gun_recoil');

        this.shacking_level = data.shacking_level;
        this.shacking_duration = data.shacking_duration;
    }

}