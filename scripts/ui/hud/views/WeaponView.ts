import { system, world } from '@minecraft/server';

import { ActorManager } from '../../../modules/combat/weapon/systems/ActorManager';
import { GunRaiseSystem } from '../../../modules/combat/weapon/systems/gun/GunRaiseSystem';
import { InvincibilitySystem } from '../../../modules/combat/InvincibilitySystem';
import { gameroom } from '../../../modules/core/GameRoom';
import { GameModeEnum } from '../../../modules/core/GameModeEnum';

import { InGameHud } from '../../InGameHud';
import { HudDriver } from '../drivers/HudDriver';

import { FormatCode as FC } from '../../../utils/FormatCode';
import { getPlayerHandItem } from '../../../utils/others/Entity';

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
            const storageAmmoText =
                gameroom().gameMode === GameModeEnum.Deathmatch ? '∞' : `${magazineComp.storageAmmo}`;
            const ammoText = `${magazineComp.ammo}/${storageAmmoText}`;
            const invText = InvincibilitySystem.getInvincibilityText(player);

            let finalText = '';
            if (invText) finalText += `${invText}\n`;

            finalText += ammoText;

            const forceUpdateChar = system.currentTick % 40 === 0 ? FC.Reset : '';
            HudDriver.pushActionbar(player, finalText + forceUpdateChar, 2, 'weapon_info');
        }
    }
}

world.afterEvents.worldLoad.subscribe(() => {
    system.runInterval(() => new WeaponView().update());
});
