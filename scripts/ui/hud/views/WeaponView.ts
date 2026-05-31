import { system, world } from '@minecraft/server';

import { getPlayerHandItem } from '../../../utils/others/Entity';
import { ActorManager } from '../../../modules/combat/weapon/systems/ActorManager';
import { HudDriver } from '../drivers/HudDriver';

import { InGameHud } from '../../InGameHud';

export class WeaponView implements InGameHud {
    update() {
        this.updateActionbar();
    }

    private updateActionbar() {
        const players = world.getPlayers({
            propertyOptions: [
                {
                    propertyId: 'player:is_holding_gun',
                    value: true,
                },
                {
                    propertyId: 'player:state.reload',
                    exclude: true,
                    value: 'reloading',
                },
            ],
        });

        for (const player of players) {
            const item = getPlayerHandItem(player);
            if (item === undefined || !ActorManager.isActor(item)) continue;

            const itemActor = ActorManager.getActor(item)!;
            if (!itemActor.hasComponent('gun_magazine')) continue;

            const magazineComp = itemActor.getComponent('gun_magazine')!;
            // Direct call to HudDriver to ensure precedence logic is handled
            HudDriver.pushActionbar(player, `${magazineComp.ammo}/${magazineComp.storageAmmo}`, 2, 'weapon_info');
        }
    }
}

world.afterEvents.worldLoad.subscribe(() => {
    system.runInterval(() => new WeaponView().update());
});
