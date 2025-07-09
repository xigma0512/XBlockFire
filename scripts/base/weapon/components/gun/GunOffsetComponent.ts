import { Component } from "../Component";

type ComponentDataType = {
    hipfire: number;
    scope: number;
    movement: number;
}

export class GunOffsetComponent extends Component {

    readonly hipfire: number;
    readonly scope: number;
    readonly movement: number;

    constructor(data: ComponentDataType) {
        super('gun_offset');
        
        this.hipfire = data.hipfire;
        this.scope = data.scope;
        this.movement = data.movement;
    }
}