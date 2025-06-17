export const enum FireModeEnum {
    'Fully-Auto',
    'Semi-Auto'
}

export const enum GunTypeEnum {
    'Glock17' = 0
}

export const enum GrenadeTypeEnum {
    'Flashbang' = 0,
    'SmokeGrenade'
}

export const enum TeamTagEnum {
    Spectator = 0,
    Attacker,
    Defender
}

export type GunReloadStateEnum = 'idle' | 'pre_reload' |'reloading' | 'success' | 'fail' 