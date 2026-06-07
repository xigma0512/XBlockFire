import { Player, system, world } from '@minecraft/server';
import { HudDriver } from '../../ui/hud/drivers/HudDriver';
import { progressBar } from '../../utils/others/Format';

interface InvincibilityState {
    startTick: number;
    expireTick: number;
}

export class InvincibilitySystem {
    private static readonly invinciblePlayers = new Map<string, InvincibilityState>();

    static setInvincible(player: Player, ticks: number) {
        this.invinciblePlayers.set(player.name, {
            startTick: system.currentTick,
            expireTick: system.currentTick + ticks,
        });
    }

    static isInvincible(player: Player) {
        const state = this.invinciblePlayers.get(player.name);
        if (state === undefined) return false;

        if (system.currentTick > state.expireTick) {
            this.invinciblePlayers.delete(player.name);
            return false;
        }

        return true;
    }

    static getInvincibilityText(player: Player): string | undefined {
        const state = this.invinciblePlayers.get(player.name);
        if (state === undefined) return undefined;

        const remainingTicks = state.expireTick - system.currentTick;
        if (remainingTicks <= 0) {
            this.invinciblePlayers.delete(player.name);
            return undefined;
        }

        return this.formatText(state, remainingTicks);
    }

    static update() {
        for (const [playerName, state] of this.invinciblePlayers.entries()) {
            const remainingTicks = state.expireTick - system.currentTick;
            if (remainingTicks <= 0) {
                this.invinciblePlayers.delete(playerName);
                continue;
            }

            const player = world.getPlayers().find((p) => p.name === playerName);
            if (!player) continue;

            const isHoldingGun = player.getDynamicProperty('player:is_holding_gun');
            if (!isHoldingGun) {
                HudDriver.pushActionbar(player, this.formatText(state, remainingTicks), 2, 'invincibility');
            }
        }
    }

    private static formatText(state: InvincibilityState, remainingTicks: number) {
        const totalTicks = Math.max(1, state.expireTick - state.startTick);
        const safeRemainingTicks = Math.max(0, Math.min(totalTicks, remainingTicks));
        const elapsedTicks = totalTicks - safeRemainingTicks;

        return `無敵時間\n${progressBar(totalTicks, elapsedTicks, 30)}`;
    }
}

system.runInterval(() => InvincibilitySystem.update());
