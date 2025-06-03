import { VanillaEntityIdentifier } from "@minecraft/server";
import { Component } from "./Component";

type ComponentDataType = {
    flightSpeed: number,
}

export class BulletComponent extends Component {
    
    readonly flightSpeed: number;

    constructor(data: ComponentDataType) {
        super('bullet');

        this.flightSpeed = data.flightSpeed;
    }

}