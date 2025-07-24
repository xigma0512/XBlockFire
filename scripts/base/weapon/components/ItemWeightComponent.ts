import { Component } from "./Component";

type ComponentDataType = {
    weight: number;
}

export class ItemWeightComponent extends Component {
    
    readonly weight: number;

    constructor(data: ComponentDataType) {
        super('item_weight');
        
        this.weight = data.weight;
    }
}