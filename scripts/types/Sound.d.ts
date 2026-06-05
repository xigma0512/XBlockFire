import { Player } from '@minecraft/server';
import { SoundRegistry } from '../ui/media/SoundTable';

export type SoundKey = keyof typeof SoundRegistry;
export type SoundTarget = Player | Player[] | undefined;
