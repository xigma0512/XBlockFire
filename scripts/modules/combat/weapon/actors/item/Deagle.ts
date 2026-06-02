import { GUN_CONFIGS } from '../../config/gun/GunConfigs';
import { GunActor } from './GunActor';

export class Deagle extends GunActor {
    clone() {
        return new Deagle();
    }

    constructor() {
        super(GUN_CONFIGS.deagle);
    }
}
