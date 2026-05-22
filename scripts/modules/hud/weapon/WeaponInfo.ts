import { system, world } from "@minecraft/server";
import { getPlayerHandItem } from "../../../utils/others/Entity";
import { ActorManager } from "../../../base/weapon/systems/ActorManager";
import { MessageManager as Msg } from "../MessageManager";

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
                },
                {
                    propertyId: 'player:state.reload',
                    exclude: true,
                    value: 'reloading'
                }
            ]
        });

        for (const player of players) {
            const item = getPlayerHandItem(player);
            if (item === undefined || !ActorManager.isActor(item)) continue;
            
            const itemActor = ActorManager.getActor(item)!;
            if (!itemActor.hasComponent('gun_magazine')) continue;

            const magazineComp = itemActor.getComponent('gun_magazine')!;
            Msg.rawActionbar(`${magazineComp.ammo}/${magazineComp.storageAmmo}`, player);
        }
    }
}

world.afterEvents.worldLoad.subscribe(() => {
    system.runInterval(() => new WeaponInfo().update());
})
