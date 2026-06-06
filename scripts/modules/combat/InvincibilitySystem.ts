import { Player, system, world } from '@minecraft/server';
import { FormatCode as FC } from '../../utils/FormatCode';
import { HudDriver } from '../../ui/hud/drivers/HudDriver';

export class InvincibilitySystem {
    private static readonly invinciblePlayers = new Map<string, number>();

    static setInvincible(player: Player, ticks: number) {
        this.invinciblePlayers.set(player.name, system.currentTick + ticks);
    }

    static isInvincible(player: Player) {
        const expireTick = this.invinciblePlayers.get(player.name);
        if (expireTick === undefined) return false;
        
        if (system.currentTick > expireTick) {
            this.invinciblePlayers.delete(player.name);
            return false;
        }
        
        return true;
    }

    static getInvincibilityText(player: Player): string | undefined {
        const expireTick = this.invinciblePlayers.get(player.name);
        if (expireTick === undefined) return undefined;
        
        const remainingTicks = expireTick - system.currentTick;
        if (remainingTicks <= 0) {
            this.invinciblePlayers.delete(player.name);
            return undefined;
        }

        const seconds = Math.ceil(remainingTicks / 20);
        return `${FC.Gold}無敵時間: ${seconds}秒`;
    }

    static update() {
        for (const [playerName, expireTick] of this.invinciblePlayers.entries()) {
            const remainingTicks = expireTick - system.currentTick;
            if (remainingTicks <= 0) {
                this.invinciblePlayers.delete(playerName);
                continue;
            }

            const player = world.getPlayers().find(p => p.name === playerName);
            if (!player) continue;

            // Only push if not holding a gun, otherwise WeaponView will handle it
            const isHoldingGun = player.getDynamicProperty('player:is_holding_gun');
            if (!isHoldingGun) {
                const seconds = Math.ceil(remainingTicks / 20);
                HudDriver.pushActionbar(player, `${FC.Gold}無敵時間: ${seconds}秒`, 2, 'invincibility');
            }
        }
    }
}

system.runInterval(() => InvincibilitySystem.update());
