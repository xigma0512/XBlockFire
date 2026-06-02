import { system, world } from '@minecraft/server';

import { getPlayerHandItem } from '../../../utils/others/Entity';
import { ActorManager } from '../../../modules/combat/weapon/systems/ActorManager';
import { GunRaiseSystem } from '../../../modules/combat/weapon/systems/gun/GunRaiseSystem';
import { FormatCode as FC } from '../../../utils/FormatCode';
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
            const ammoText = `${magazineComp.ammo}/${magazineComp.storageAmmo}`;
            const raiseProgress = GunRaiseSystem.getRaiseProgressBar(player);
            if (raiseProgress !== undefined) {
                HudDriver.pushActionbar(player, `${raiseProgress}\n${FC.Reset}${ammoText}`, 2, 'weapon_info');
                continue;
            }

            // Direct call to HudDriver to ensure precedence logic is handled
            HudDriver.pushActionbar(player, ammoText, 2, 'weapon_info');
        }
    }
}

world.afterEvents.worldLoad.subscribe(() => {
    system.runInterval(() => new WeaponView().update());
});
