import { Player, system, world } from '@minecraft/server';

import { gameEvents } from '../../../event/EventEmitter';
import { FireModeEnum } from '../../../modules/combat/weapon/WeaponEnum';

const XP_BAR_MAX_AT_LEVEL_ZERO = 7;

interface FireCooldownState {
    player: Player;
    originalTotalXp: number;
    taskId: number;
}

export class GunFireCooldownView {
    private static readonly _states = new Map<string, FireCooldownState>();

    static start(player: Player, duration: number) {
        const existing = this._states.get(player.id);
        if (existing) system.clearRun(existing.taskId);

        const originalTotalXp = existing?.originalTotalXp ?? player.getTotalXp();
        const startTick = system.currentTick;

        const taskId = system.runInterval(() => {
            const elapsed = Math.min(system.currentTick - startTick, duration);
            this.setExperienceBarProgress(player, 1 - elapsed / duration);

            if (elapsed >= duration) {
                this.restoreExperience(player, originalTotalXp);
                system.clearRun(taskId);
                this._states.delete(player.id);
            }
        });

        this._states.set(player.id, { player, originalTotalXp, taskId });
        system.run(() => {
            if (this._states.get(player.id)?.taskId !== taskId || !player.isValid) return;
            this.setExperienceBarProgress(player, 1);
        });
    }

    static cleanupPlayer(player: Player) {
        const state = this._states.get(player.id);
        if (!state) return;

        this._states.delete(player.id);
        system.clearRun(state.taskId);
        system.run(() => {
            if (player.isValid) this.restoreExperience(player, state.originalTotalXp);
        });
    }

    private static setExperienceBarProgress(player: Player, progress: number) {
        const clampedProgress = Math.max(0, Math.min(1, progress));
        const displayXp = Math.round(clampedProgress * XP_BAR_MAX_AT_LEVEL_ZERO);

        player.resetLevel();
        if (displayXp > 0) player.addExperience(displayXp);
    }

    private static restoreExperience(player: Player, totalXp: number) {
        player.resetLevel();
        if (totalXp > 0) player.addExperience(totalXp);
    }
}

gameEvents.subscribe('gunFired', ({ shooter, fireMode, fireRate }) => {
    if (fireMode !== FireModeEnum['Semi-Auto']) return;

    GunFireCooldownView.start(shooter, fireRate);
});

world.beforeEvents.playerLeave.subscribe((ev) => {
    GunFireCooldownView.cleanupPlayer(ev.player);
});
