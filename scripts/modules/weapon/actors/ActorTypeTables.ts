import { GrenadeTypeEnum, GunTypeEnum } from "../../../types/weapon/WeaponEnum";
import { AK47Bullet } from "./entity/bullet/AK47Bullet";

import { Glock17Bullet } from "./entity/bullet/Glock17Bullet";
import { Flashbang } from "./entity/grenade/Flashbang";
import { SmokeGrenade } from "./entity/grenade/SmokeGrenade";

export const BulletActorTable = {
    [GunTypeEnum.Glock17]: Glock17Bullet,
    [GunTypeEnum.AK47]: AK47Bullet
}

export const GrenadeActorTable = {
    [GrenadeTypeEnum.Flashbang]: Flashbang,
    [GrenadeTypeEnum.SmokeGrenade]: SmokeGrenade
}