import { Sound } from '../../../../../ui/media/Sound';
import { ItemActor } from '../../actors/Actor';

import { Player, world } from '@minecraft/server';

export class GunAnimations {
    static playGunFireAnimation(owner: Player, gunActor: ItemActor) {
        const recoilComp = gunActor.getComponent('gun_recoil')!;
        if (owner.isSneaking) {
            owner.runCommand(
                `camerashake add @s ${recoilComp.scope_recoil.level} ${recoilComp.scope_recoil.duration} rotational`
            );
        } else {
            owner.runCommand(
                `camerashake add @s ${recoilComp.hipfire_recoil.level} ${recoilComp.hipfire_recoil.duration} rotational`
            );
        }

        const name = gunActor.typeId;
        const sound = `xblockfire.fire.${name}`;

        Sound.playPerspective({
            owner,
            listeners: world.getPlayers(),
            self: sound,
            world: `${sound}.3d`,
            location: owner.location,
            options: { volume: 4 },
        });
    }

    static playGunReloadAnimation(owner: Player, gunActor: ItemActor) {
        const name = gunActor.typeId;
        const sound = `xblockfire.reload.${name}`;

        Sound.playPerspective({
            owner,
            listeners: world.getPlayers(),
            self: sound,
            world: `${sound}.3d`,
            location: owner.location,
            options: { volume: 4 },
        });
    }

    static playGunRaiseAnimation(owner: Player, gunActor: ItemActor) {
        const name = gunActor.typeId;
        const sound = `xblockfire.raise.${name}`;

        Sound.playTo(sound, owner);
    }
}
