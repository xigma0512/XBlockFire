import { ItemLockMode } from '@minecraft/server';
import { FireModeEnum, GunTypeEnum } from '../../WeaponEnum';
import { GunConfigType } from './GunConfigType';

const defaultItem = (nametag: string) => ({
    nametag,
    lore: [],
    keepOnDeath: true,
    lockMode: ItemLockMode.slot,
});

const pistol = {
    glock17: {
        id: 'glock17',
        itemTypeId: 'xblockfire:glock17',
        item: defaultItem('Glock17'),
        weight: 0.12,
        gunTypeId: GunTypeEnum.Glock17,
        raiseTime: 7,
        magazine: { ammo: 12, count: 5 },
        fire: {
            mode: FireModeEnum['Semi-Auto'],
            releaseToFire: false,
            bulletSpread: 1,
            rate: 3,
            sound: 'xblockfire.glock17_fire',
        },
        recoil: {
            scope: { level: 0.02, duration: 0.2 },
            hipfire: { level: 0.04, duration: 0.2 },
        },
        damage: {
            near: { head: 10, body: 8, legs: 6 },
            medium: { head: 8, body: 7, legs: 5 },
            far: { head: 6, body: 5, legs: 3 },
        },
        reload: { time: 25, sound: 'xblockfire.glock17_reload' },
        offset: { scope: 0, hipfire: 0.005, movement: 0.004 },
    },
    deagle: {
        id: 'deagle',
        itemTypeId: 'xblockfire:deagle',
        item: defaultItem('Deagle'),
        weight: 0.12,
        gunTypeId: GunTypeEnum.Deagle,
        raiseTime: 8,
        magazine: { ammo: 7, count: 5 },
        fire: {
            mode: FireModeEnum['Semi-Auto'],
            releaseToFire: false,
            bulletSpread: 1,
            rate: 5,
            sound: 'xblockfire.deagle_fire',
        },
        recoil: {
            scope: { level: 0.02, duration: 0.2 },
            hipfire: { level: 0.06, duration: 0.2 },
        },
        damage: {
            near: { head: 16, body: 13, legs: 10 },
            medium: { head: 14, body: 11, legs: 9 },
            far: { head: 11, body: 9, legs: 7 },
        },
        reload: { time: 36, sound: 'xblockfire.deagle_reload' },
        offset: { scope: 0.001, hipfire: 0.008, movement: 0.012 },
    },
};

const assault = {
    ak47: {
        id: 'ak47',
        itemTypeId: 'xblockfire:ak47',
        item: defaultItem('AK47'),
        weight: 0.1,
        gunTypeId: GunTypeEnum.AK47,
        raiseTime: 15,
        magazine: { ammo: 25, count: 5 },
        fire: {
            mode: FireModeEnum['Fully-Auto'],
            releaseToFire: false,
            bulletSpread: 1,
            rate: 3,
            sound: 'xblockfire.ak47_fire',
        },
        recoil: {
            scope: { level: 0.02, duration: 0.2 },
            hipfire: { level: 0.06, duration: 0.2 },
        },
        damage: {
            near: { head: 12, body: 10, legs: 8 },
            medium: { head: 11, body: 9, legs: 7 },
            far: { head: 9, body: 8, legs: 6 },
        },
        reload: { time: 45, sound: 'xblockfire.ak47_reload' },
        offset: { scope: 0.001, hipfire: 0.035, movement: 0.04 },
    },
    m4a4: {
        id: 'm4a4',
        itemTypeId: 'xblockfire:m4a4',
        item: defaultItem('M4A4'),
        weight: 0.1,
        gunTypeId: GunTypeEnum.M4A4,
        raiseTime: 15,
        magazine: { ammo: 30, count: 5 },
        fire: {
            mode: FireModeEnum['Fully-Auto'],
            releaseToFire: false,
            bulletSpread: 1,
            rate: 2,
            sound: 'xblockfire.m4a4_fire',
        },
        recoil: {
            scope: { level: 0.02, duration: 0.2 },
            hipfire: { level: 0.06, duration: 0.2 },
        },
        damage: {
            near: { head: 11, body: 9, legs: 7 },
            medium: { head: 10, body: 8, legs: 6 },
            far: { head: 8, body: 7, legs: 5 },
        },
        reload: { time: 40, sound: 'xblockfire.m4a4_reload' },
        offset: { scope: 0.001, hipfire: 0.025, movement: 0.025 },
    },
};

const sniper = {
    awp: {
        id: 'awp',
        itemTypeId: 'minecraft:spyglass',
        item: defaultItem('AWP'),
        weight: 0.095,
        gunTypeId: GunTypeEnum.AWP,
        raiseTime: 25,
        magazine: { ammo: 5, count: 5 },
        fire: {
            mode: FireModeEnum['Semi-Auto'],
            releaseToFire: true,
            bulletSpread: 1,
            rate: 20,
            sound: 'xblockfire.awp_fire',
        },
        recoil: {
            scope: { level: 0.06, duration: 0.2 },
            hipfire: { level: 0.1, duration: 0.2 },
        },
        damage: {
            near: { head: 100, body: 58, legs: 45 },
            medium: { head: 100, body: 58, legs: 43 },
            far: { head: 100, body: 58, legs: 40 },
        },
        reload: { time: 60, sound: 'xblockfire.awp_reload' },
        offset: { scope: 0, hipfire: 0.008, movement: 0.5 },
    },
};

const machine_gun = {
    p90: {
        id: 'p90',
        itemTypeId: 'xblockfire:p90',
        item: defaultItem('P90'),
        weight: 0.11,
        gunTypeId: GunTypeEnum.P90,
        raiseTime: 12,
        magazine: { ammo: 50, count: 5 },
        fire: {
            mode: FireModeEnum['Fully-Auto'],
            releaseToFire: false,
            bulletSpread: 1,
            rate: 2,
            sound: 'xblockfire.p90_fire',
        },
        recoil: {
            scope: { level: 0.02, duration: 0.2 },
            hipfire: { level: 0.06, duration: 0.2 },
        },
        damage: {
            near: { head: 7, body: 6, legs: 5 },
            medium: { head: 5, body: 5, legs: 4 },
            far: { head: 3, body: 3, legs: 2 },
        },
        reload: { time: 50, sound: 'xblockfire.p90_reload' },
        offset: { scope: 0.008, hipfire: 0.02, movement: 0.008 },
    },
};

const shotgun = {
    sg200: {
        id: 'sg200',
        itemTypeId: 'xblockfire:sg200',
        item: defaultItem('SG200'),
        weight: 0.09,
        gunTypeId: GunTypeEnum.SG200,
        raiseTime: 20,
        magazine: { ammo: 6, count: 5 },
        fire: {
            mode: FireModeEnum['Semi-Auto'],
            releaseToFire: false,
            bulletSpread: 8,
            rate: 20,
            sound: 'xblockfire.sg200_fire',
        },
        recoil: {
            scope: { level: 0.08, duration: 0.2 },
            hipfire: { level: 0.12, duration: 0.2 },
        },
        damage: {
            near: { head: 5, body: 4, legs: 3 },
            medium: { head: 3, body: 2, legs: 1 },
            far: { head: 1, body: 1, legs: 0 },
        },
        reload: { time: 40, sound: 'xblockfire.sg200_reload' },
        offset: { scope: 0.05, hipfire: 0.09, movement: 0.06 },
    },
};

export const GUN_CONFIGS = {
    ...pistol,
    ...assault,
    ...sniper,
    ...machine_gun,
    ...shotgun,
} as Record<string, GunConfigType>;
