import { GrenadeTypeEnum, GunTypeEnum } from "./Enums";

import { Glock17Bullet } from "../actors/entity/Glock17Bullet";
import { Flashbang } from "../actors/entity/Flashbang";
import { SmokeGrenade } from "../actors/entity/SmokeGrenade";

export const BulletActorTable = {
    [GunTypeEnum.Glock17]: Glock17Bullet
}

export const GrenadeActorTable = {
    [GrenadeTypeEnum.Flashbang]: Flashbang,
    [GrenadeTypeEnum.SmokeGrenade]: SmokeGrenade
}