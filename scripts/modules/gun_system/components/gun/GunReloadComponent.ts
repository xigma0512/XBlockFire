import { Component } from "../Component";

type ReloadDataType = {
    reload_time: number;
}

export class GunReloadComponent extends Component {
    
    readonly reload_time: number;

    constructor(data: ReloadDataType) {
        super('gun_reload');
        
        this.reload_time = data.reload_time;
    }
}