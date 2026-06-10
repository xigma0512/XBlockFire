import { GrenadeTypeEnum } from '../WeaponEnum';

import { Flashbang } from './entity/grenade/Flashbang';
import { Fragmentation } from './entity/grenade/Fragmentation';
import { SmokeGrenade } from './entity/grenade/SmokeGrenade';

export const GrenadeActorTable = {
    [GrenadeTypeEnum.Flashbang]: Flashbang,
    [GrenadeTypeEnum.SmokeGrenade]: SmokeGrenade,
    [GrenadeTypeEnum.Fragmentation]: Fragmentation,
};
