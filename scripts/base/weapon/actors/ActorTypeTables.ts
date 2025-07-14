import { GrenadeTypeEnum, GunTypeEnum } from "../../../types/weapon/WeaponEnum";

import { AWPBullet } from "./entity/bullet/AWPBullet";
import { AK47Bullet } from "./entity/bullet/AK47Bullet";
import { M4A4Bullet } from "./entity/bullet/M4A4Bullet";
import { SG200Bullet } from "./entity/bullet/SG200Bullet";

import { Glock17Bullet } from "./entity/bullet/Glock17Bullet";
import { DeagleBullet } from "./entity/bullet/DeagleBullet";

import { Flashbang } from "./entity/grenade/Flashbang";
import { SmokeGrenade } from "./entity/grenade/SmokeGrenade";

export const BulletActorTable = {
    [GunTypeEnum.AWP]: AWPBullet,
    [GunTypeEnum.AK47]: AK47Bullet,
    [GunTypeEnum.M4A4]: M4A4Bullet,
    [GunTypeEnum.SG200]: SG200Bullet,

    [GunTypeEnum.Glock17]: Glock17Bullet,
    [GunTypeEnum.Deagle]: DeagleBullet
}

export const GrenadeActorTable = {
    [GrenadeTypeEnum.Flashbang]: Flashbang,
    [GrenadeTypeEnum.SmokeGrenade]: SmokeGrenade
}