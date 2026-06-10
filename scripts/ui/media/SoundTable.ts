import { PlayerSoundOptions } from '@minecraft/server';

interface SoundDefinition {
    readonly id: string;
    readonly options?: PlayerSoundOptions;
}

export const SoundRegistry = {
    // Game Sounds
    START_ROUND: { id: 'mob.villager.idle', options: { volume: 1 } },
    ACTION_START: { id: 'mob.blaze.shoot', options: { pitch: 1.2, volume: 1 } },
    BUYING_COUNTDOWN_TICK: { id: 'random.click', options: { pitch: 1.5, volume: 1 } },
    ROUND_END: { id: 'mob.wolf.whine', options: { pitch: 0.8, volume: 1 } },

    THIRTY_SEC_LEFT: { id: 'xblockfire.30_sec_left' },

    WAITING_COUNTDOWN_START: { id: 'random.toast', options: { pitch: 1.2, volume: 1 } },
    WAITING_COUNTDOWN_CANCEL: { id: 'block.false_permissions', options: { pitch: 0.8, volume: 1 } },

    ROUND_WIN: { id: 'random.levelup', options: { pitch: 1.2, volume: 1 } },
    ROUND_LOSE: { id: 'respawn_anchor.deplete', options: { pitch: 0.8, volume: 1 } },

    SWITCH_SIDE: { id: 'beacon.activate', options: { pitch: 0.8, volume: 1 } },

    // Player Sounds
    PLAYER_KILL: { id: 'random.levelup', options: { pitch: 1.4, volume: 1 } },
    PLAYER_DEATH: { id: 'random.hurt', options: { volume: 1, pitch: 0.9 } },
    PLAYER_HURT: { id: 'game.player.hurt' },
    PLAYER_HIT: { id: 'damage.fallsmall', options: { pitch: 2.5 } },

    MEMBER_JOIN: { id: 'random.pop', options: { pitch: 1.4, volume: 0.8 } },
    MEMBER_LEAVE: { id: 'random.pop2', options: { pitch: 0.8, volume: 0.8 } },

    SUDDEN_DEATH_START: { id: 'mob.wither.spawn' },

    // Shop Sounds
    SHOP_OPEN: { id: 'ui.chest_open' },
    SHOP_CLOSE: { id: 'ui.chest_close' },
    SHOP_YES: { id: 'mob.villager.yes' },
    SHOP_NO: { id: 'mob.villager.no' },

    // C4 Sounds
    C4_BEEP: { id: 'xblockfire.c4_beep', options: { volume: 5 } },
    C4_EXPLOSION: { id: 'xblockfire.c4_explosion', options: { volume: 3 } },
    C4_DEFUSED: { id: 'xblockfire.c4_defused' },
    C4_DEFUSING: { id: 'xblockfire.defusing', options: { volume: 3 } },

    // Grenades
    FRAG_EXPLODE: { id: 'xblockfire.frag_explode', options: { volume: 3 }}
} as Record<string, SoundDefinition>;
