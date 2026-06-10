import { Entity } from '@minecraft/server';

import { GrenadeActorTable } from '../../actors/ActorTypeTables';
import { GrenadeTypeEnum } from '../../WeaponEnum';
import { FlashbangHandler } from './handlers/Flashbang';
import { FragmentationHandler } from './handlers/Fragmentation';
import { GrenadeHandler } from './handlers/GrenadeHandler';
import { IncendiaryGrenadeHandler } from './handlers/IncendiaryGrenade';
import { SmokeGrenadeHandler } from './handlers/SmokeGrenade';

const handlerTable = {
    [GrenadeTypeEnum.SmokeGrenade]: SmokeGrenadeHandler,
    [GrenadeTypeEnum.Flashbang]: FlashbangHandler,
    [GrenadeTypeEnum.Fragmentation]: FragmentationHandler,
    [GrenadeTypeEnum.IncendiaryGrenade]: IncendiaryGrenadeHandler,
};

export function createGrenadeHandler(grenadeType: GrenadeTypeEnum, grenade: Entity): GrenadeHandler {
    const Actor = GrenadeActorTable[grenadeType];
    const Handler = handlerTable[grenadeType];

    return new Handler(new Actor(grenade));
}
