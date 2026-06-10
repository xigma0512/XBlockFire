import { ItemLockMode } from '@minecraft/server';
import { FireModeEnum, GunTypeEnum } from '../../WeaponEnum';
import { ComponentTypes } from '../../components/Component';

type DamageTable = {
    head: number;
    body: number;
    legs: number;
};

type RecoilConfig = {
    level: number;
    duration: number;
};

export type GunConfigType = {
    id: string;
    itemTypeId: string;
    item: {
        nametag: string;
        lore: string[];
        keepOnDeath: boolean;
        lockMode: ItemLockMode;
    };
    weight: number;
    gunTypeId: GunTypeEnum;
    raiseTime: number;
    magazine: {
        ammo: number;
        count: number;
    };
    fire: {
        mode: FireModeEnum;
        releaseToFire: boolean;
        bulletSpread: number;
        rate: number;
    };
    recoil: {
        scope: RecoilConfig;
        hipfire: RecoilConfig;
    };
    damage: {
        near: DamageTable;
        medium: DamageTable;
        far: DamageTable;
    };
    reload: {
        time: number;
    };
    offset: {
        scope: number;
        hipfire: number;
        movement: number;
    };
};

export const REQUIRED_GUN_COMPONENTS = [
    'item',
    'item_weight',
    'gun',
    'gun_raise',
    'gun_magazine',
    'gun_fire',
    'gun_recoil',
    'gun_damage',
    'gun_reload',
    'gun_offset',
] as const satisfies readonly (keyof ComponentTypes)[];
