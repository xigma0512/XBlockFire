import { system, world } from "@minecraft/server";
import { getPlayerHandItem } from "../../../utils/others/Entity";
import { ActorManager } from "../../weapon/systems/ActorManager";
import { HudTextController } from "../HudTextController";

export class WeaponInfo implements InGameHud {
    
    update() {
        this.updateActionbar();
    }

    private updateActionbar() {
        const players = world.getPlayers({
            propertyOptions: [
                {
                    propertyId: 'player:is_holding_gun',
                    value: true
                }
            ]
        });

        for (const player of players) {
            const item = getPlayerHandItem(player);
            if (item === undefined || !ActorManager.isActor(item)) continue;
            
            const itemActor = ActorManager.getActor(item)!;
            if (!itemActor.hasComponent('gun_magazine')) continue;

            const magazineComp = itemActor.getComponent('gun_magazine')!;
            HudTextController.add(player, 'actionbar', `${magazineComp.ammo}/${magazineComp.storageAmmo}`);
        }
    }
}

world.afterEvents.worldLoad.subscribe(() => {
    system.runInterval(() => new WeaponInfo().update());
})