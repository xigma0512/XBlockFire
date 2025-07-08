import { GrenadeTypeEnum, GunTypeEnum } from "../../../types/weapon/WeaponEnum";

import { Glock17Bullet } from "./entity/bullet/Glock17Bullet";
import { Flashbang } from "./entity/grenade/Flashbang";
import { SmokeGrenade } from "./entity/grenade/SmokeGrenade";

export const BulletActorTable = {
    [GunTypeEnum.Glock17]: Glock17Bullet
}

export const GrenadeActorTable = {
    [GrenadeTypeEnum.Flashbang]: Flashbang,
    [GrenadeTypeEnum.SmokeGrenade]: SmokeGrenade
}