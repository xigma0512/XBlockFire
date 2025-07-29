import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { ItemActor } from "../../actors/Actor";

import { Player, world } from "@minecraft/server";

export class GunAnimations {
    static playerGunFireAnimation(owner: Player, gunActor: ItemActor) {
        const recoilComp = gunActor.getComponent('gun_recoil')!;
        if (owner.isSneaking) {
            owner.runCommand(`camerashake add @s ${recoilComp.scope_recoil.level} ${recoilComp.scope_recoil.duration} rotational`);
        } else {
            owner.runCommand(`camerashake add @s ${recoilComp.hipfire_recoil.level} ${recoilComp.hipfire_recoil.duration} rotational`);
        }
        
        const gunComp = gunActor.getComponent('gun_fire')!;
        owner.playSound(gunComp.fire_sound ?? '');
        Broadcast.sound(
            `${gunComp.fire_sound}.3d`,
            {location: owner.location, volume: 4},
            world.getPlayers({excludeNames: [owner.name]})
        );
    }

    static playGunReloadAnimation(owner: Player, gunActor: ItemActor) {
        const reloadComp = gunActor.getComponent('gun_reload')!;
        owner.playSound(reloadComp.reload_sound ?? '');
        Broadcast.sound(
            `${reloadComp.reload_sound}.3d`,
            { location: owner.location, volume: 2 },
            world.getPlayers({excludeNames: [owner.name]})
        );
    }
}