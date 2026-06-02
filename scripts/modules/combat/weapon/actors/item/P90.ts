import { GUN_CONFIGS } from '../../config/gun/GunConfigs';
import { GunActor } from './GunActor';

export class P90 extends GunActor {
    clone() {
        return new P90();
    }

    constructor() {
        super(GUN_CONFIGS.p90);
    }
}
