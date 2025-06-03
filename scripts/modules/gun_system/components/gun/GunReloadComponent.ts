import { Component } from "../Component";

type ComponentDataType = {
    reload_time: number;
}

export class GunReloadComponent extends Component {
    
    readonly reload_time: number;

    constructor(data: ComponentDataType) {
        super('gun_reload');
        
        this.reload_time = data.reload_time;
    }
}