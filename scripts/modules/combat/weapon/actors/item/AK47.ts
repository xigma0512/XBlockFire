import { GUN_CONFIGS } from '../../config/gun/GunConfigs';
import { GunActor } from './GunActor';

export class AK47 extends GunActor {
    clone() {
        return new AK47();
    }

    constructor() {
        super(GUN_CONFIGS.ak47);
    }
}
