import { Component } from '../Component';

type ComponentDataType = {
    raise_time: number;
};

export class GunRaiseComponent extends Component {
    
    readonly raise_time: number;

    constructor(data: ComponentDataType) {
        super('gun_raise');

        this.raise_time = data.raise_time;
    }
}
