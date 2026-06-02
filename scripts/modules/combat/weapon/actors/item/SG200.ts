import { GUN_CONFIGS } from '../../config/gun/GunConfigs';
import { GunActor } from './GunActor';

export class SG200 extends GunActor {
    clone() {
        return new SG200();
    }

    constructor() {
        super(GUN_CONFIGS.sg200);
    }
}
