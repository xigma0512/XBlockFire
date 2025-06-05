import { Component } from "./Component";

type ComponentDataType = {
    bounceFactor: number;
}

export class ProjectileReboundComponent extends Component {

    readonly bounceFactor: number;

    constructor(data: ComponentDataType) {
        super('projectile_rebound');

        this.bounceFactor = data.bounceFactor;
    }
    
}