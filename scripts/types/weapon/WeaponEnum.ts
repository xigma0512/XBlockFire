export const enum FireModeEnum {
    'Fully-Auto',
    'Semi-Auto'
}

export const enum GunTypeEnum {
    'AK47',
    'M4A4',
    'SG200',
    'Glock17',
    'Deagle'
}

export const enum GrenadeTypeEnum {
    'Flashbang' = 0,
    'SmokeGrenade'
}

export type GunReloadStateEnum = 'idle' | 'pre_reload' |'reloading' | 'success' | 'fail' 