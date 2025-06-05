import { GrenadeTypeEnum, GunTypeEnum } from "../types/Enums";

import { Glock17Bullet } from "./entity/Glock17Bullet";
import { Flashbang } from "./entity/Flashbang";
import { SmokeGrenade } from "./entity/SmokeGrenade";

export const BulletActorTable = {
    [GunTypeEnum.Glock17]: Glock17Bullet
}

export const GrenadeActorTable = {
    [GrenadeTypeEnum.Flashbang]: Flashbang,
    [GrenadeTypeEnum.SmokeGrenade]: SmokeGrenade
}