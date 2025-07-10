import { Broadcast } from "../../../../utils/Broadcast";
import { ItemActor } from "../../actors/Actor";

import { Player, world } from "@minecraft/server";

export class GunAnimations {
    static playerGunFireAnimation(owner: Player, gunActor: ItemActor) {
        const recoilComp = gunActor.getComponent('gun_recoil')!;
        owner.runCommand(`camerashake add @s ${recoilComp.shacking_level} ${recoilComp.shacking_duration} rotational`);
        
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