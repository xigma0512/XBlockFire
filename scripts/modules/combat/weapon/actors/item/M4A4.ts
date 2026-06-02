import { GUN_CONFIGS } from '../../config/gun/GunConfigs';
import { GunActor } from './GunActor';

export class M4A4 extends GunActor {
    clone() {
        return new M4A4();
    }

    constructor() {
        super(GUN_CONFIGS.m4a4);
    }
}
