import { ItemActor } from "../../actors/Actor";

import { Player } from "@minecraft/server";

export class GunAnimations {
    static applyFireAnimation(owner: Player, gunActor: ItemActor) {
        const recoilComp = gunActor.getComponent('gun_recoil')!;
        owner.runCommand(`camerashake add @s ${recoilComp.shacking_level} ${recoilComp.shacking_duration} rotational`);
        
        const gunComp = gunActor.getComponent('gun_fire')!;
        owner.playSound(gunComp.fire_sound ?? '');
    }
}