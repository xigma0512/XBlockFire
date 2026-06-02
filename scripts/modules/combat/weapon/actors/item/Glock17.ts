import { GUN_CONFIGS } from '../../config/gun/GunConfigs';
import { GunActor } from './GunActor';

export class Glock17 extends GunActor {
    clone() {
        return new Glock17();
    }

    constructor() {
        super(GUN_CONFIGS.glock17);
    }
}
