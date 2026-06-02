import { GUN_CONFIGS } from '../../config/gun/GunConfigs';
import { GunActor } from './GunActor';

export class AWP extends GunActor {
    clone() {
        return new AWP();
    }

    constructor() {
        super(GUN_CONFIGS.awp);
    }
}
