import { Component } from "../Component";

interface Recoil {
    level: number;
    duration: number;
}

type ComponentDataType = {
    scope_recoil: Recoil;
    hipfire_recoil: Recoil;
}

export class GunRecoilComponent extends Component {

    readonly scope_recoil: Recoil;
    readonly hipfire_recoil: Recoil;

    constructor(data: ComponentDataType) {
        super('gun_recoil');

        this.scope_recoil = data.scope_recoil;
        this.hipfire_recoil = data.hipfire_recoil;
    }

}