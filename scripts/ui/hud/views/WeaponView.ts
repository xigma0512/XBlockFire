import { system, world } from '@minecraft/server';

import { getPlayerHandItem } from '../../../utils/others/Entity';
import { ActorManager } from '../../../modules/combat/weapon/systems/ActorManager';
import { GunRaiseSystem } from '../../../modules/combat/weapon/systems/gun/GunRaiseSystem';
import { FormatCode as FC } from '../../../utils/FormatCode';
import { HudDriver } from '../drivers/HudDriver';

import { InGameHud } from '../../InGameHud';
import { InvincibilitySystem } from '../../../modules/combat/InvincibilitySystem';

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
            const invText = InvincibilitySystem.getInvincibilityText(player);

            let finalText = '';
            if (invText) finalText += `${invText}\n`;

            if (raiseProgress !== undefined) {
                finalText += `${raiseProgress}\n${FC.Reset}${ammoText}`;
            } else {
                finalText += ammoText;
            }

            const forceUpdateChar = system.currentTick % 40 === 0 ? FC.Reset : '';
            HudDriver.pushActionbar(player, finalText + forceUpdateChar, 2, 'weapon_info');
        }
    }
}

world.afterEvents.worldLoad.subscribe(() => {
    system.runInterval(() => new WeaponView().update());
});
