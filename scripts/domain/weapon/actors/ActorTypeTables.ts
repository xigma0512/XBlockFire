import { GrenadeTypeEnum } from "../../../declarations/enum/WeaponEnum";

import { Flashbang } from "./entity/grenade/Flashbang";
import { SmokeGrenade } from "./entity/grenade/SmokeGrenade";

export const GrenadeActorTable = {
    [GrenadeTypeEnum.Flashbang]: Flashbang,
    [GrenadeTypeEnum.SmokeGrenade]: SmokeGrenade
}