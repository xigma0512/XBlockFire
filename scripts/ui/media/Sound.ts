import { Dimension, Player, PlayerSoundOptions, Vector3, WorldSoundOptions, world } from '@minecraft/server';

export type SoundTarget = Player | Player[] | undefined;

export interface PerspectiveSoundRequest {
    owner: Player;
    listeners?: SoundTarget;
    self: string;
    world: string;
    location: Vector3;
    selfOptions?: PlayerSoundOptions;
    options?: PlayerSoundOptions;
}

export class Sound {
    private static getPlayers(target: SoundTarget): Player[] {
        if (target === undefined) return world.getAllPlayers();
        return Array.isArray(target) ? target : [target];
    }

    static playTo(soundId: string, target?: SoundTarget, options?: PlayerSoundOptions) {
        for (const player of this.getPlayers(target)) {
            player.playSound(soundId, options ?? {});
        }
    }

    static playAt(soundId: string, dimension: Dimension, location: Vector3, options?: WorldSoundOptions) {
        dimension.playSound(soundId, location, options ?? {});
    }

    static playPerspective(request: PerspectiveSoundRequest) {
        request.owner.playSound(request.self, request.selfOptions ?? {});

        const listeners = this.getPlayers(request.listeners).filter((player) => player.name !== request.owner.name);
        for (const player of listeners) {
            player.playSound(request.world, {
                ...request.options,
                location: request.location,
            });
        }
    }
}
