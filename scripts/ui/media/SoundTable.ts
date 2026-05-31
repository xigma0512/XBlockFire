import { PlayerSoundOptions } from '@minecraft/server';

interface SoundDefinition {
    readonly id: string;
    readonly options?: PlayerSoundOptions;
}

export const SoundRegistry = {
    // UI Sounds
    ERROR: { id: 'note.bass', options: { pitch: 0.5, volume: 1 } },
    SUCCESS: { id: 'random.levelup', options: { pitch: 1.5, volume: 1 } },

    // Game Sounds
    FIREWORK: { id: 'firework.launch' },
    START_ROUND: { id: 'xblockfire.start_round' },
    THIRTY_SEC_LEFT: { id: 'xblockfire.30_sec_left' },

    // C4 Sounds
    C4_BEEP: { id: 'xblockfire.c4_beep', options: { volume: 5 } },
    C4_EXPLOSION: { id: 'xblockfire.c4_explosion', options: { volume: 3 } },
    C4_DEFUSED: { id: 'xblockfire.c4_defused' },
    C4_DEFUSING: { id: 'xblockfire.defusing', options: { volume: 3 } },
} as Record<string, SoundDefinition>;

export type SoundKey = keyof typeof SoundRegistry;
