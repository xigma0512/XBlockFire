import { Component } from "../Component";

type ComponentDataType = {
    reload_time: number;
    reload_sound?: string;
}

export class GunReloadComponent extends Component {
    
    readonly reload_time: number;
    
    readonly reload_sound?: string;

    constructor(data: ComponentDataType) {
        super('gun_reload');
        
        this.reload_time = data.reload_time;
        this.reload_sound = data.reload_sound;
    }
}