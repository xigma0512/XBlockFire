import { system } from '@minecraft/server';
import type { ItemActor } from '../../actors/Actor';
import type { FireModeEnum } from '../../WeaponEnum';

export type ClearRun = (taskId: number) => void;

export interface PendingReleaseFire {
    readonly actor: ItemActor;
    readonly fireMode: FireModeEnum;
    readonly fireRate: number;
}

export interface ReloadSession {
    readonly timeoutTaskId: number;
    readonly progressTaskId: number;
    readonly reloadSound?: string;
}

interface GunPlayerState {
    fireCooldownTaskId?: number;
    fullAutoTaskId?: number;
    pendingReleaseFire?: PendingReleaseFire;
    reloadSession?: ReloadSession;
    raiseDuration?: number;
}

export class GunRuntimeState {
    private readonly players = new Map<string, GunPlayerState>();

    constructor(private readonly clearRun: ClearRun) {}

    // Fire
    isFireCoolingDown(playerId: string) {
        return this.get(playerId).fireCooldownTaskId !== undefined;
    }

    startFireCooldown(playerId: string, taskId: number) {
        this.clearFireCooldown(playerId);
        this.get(playerId).fireCooldownTaskId = taskId;
    }

    clearFireCooldown(playerId: string) {
        const state = this.get(playerId);
        if (state.fireCooldownTaskId === undefined) return;

        this.clearRun(state.fireCooldownTaskId);
        state.fireCooldownTaskId = undefined;
        this.deleteIfEmpty(playerId);
    }

    setFullAutoTask(playerId: string, taskId: number) {
        this.stopFiring(playerId);
        this.get(playerId).fullAutoTaskId = taskId;
    }

    hasFullAutoTask(playerId: string) {
        return this.get(playerId).fullAutoTaskId !== undefined;
    }

    stopFiring(playerId: string) {
        const state = this.get(playerId);
        if (state.fullAutoTaskId === undefined) return;

        this.clearRun(state.fullAutoTaskId);
        state.fullAutoTaskId = undefined;
        this.deleteIfEmpty(playerId);
    }

    setPendingReleaseFire(playerId: string, pending: PendingReleaseFire) {
        this.get(playerId).pendingReleaseFire = pending;
    }

    clearPendingReleaseFire(playerId: string) {
        const state = this.get(playerId);
        state.pendingReleaseFire = undefined;
        this.deleteIfEmpty(playerId);
    }

    consumePendingReleaseFire(playerId: string) {
        const state = this.get(playerId);
        const pending = state.pendingReleaseFire;
        state.pendingReleaseFire = undefined;
        this.deleteIfEmpty(playerId);
        return pending;
    }

    // Reload
    setReloadSession(playerId: string, session: ReloadSession) {
        this.cancelReload(playerId);
        this.get(playerId).reloadSession = session;
    }

    getReloadSession(playerId: string) {
        return this.get(playerId).reloadSession;
    }

    hasReloadSession(playerId: string) {
        return this.get(playerId).reloadSession !== undefined;
    }

    cancelReload(playerId: string) {
        const state = this.get(playerId);
        const session = state.reloadSession;
        if (!session) return;

        this.clearRun(session.timeoutTaskId);
        this.clearRun(session.progressTaskId);
        state.reloadSession = undefined;
        this.deleteIfEmpty(playerId);
        return session;
    }

    completeReload(playerId: string) {
        const state = this.get(playerId);
        const session = state.reloadSession;
        if (session) this.clearRun(session.progressTaskId);

        state.reloadSession = undefined;
        this.deleteIfEmpty(playerId);
        return session;
    }

    // Raise
    setRaiseDuration(playerId: string, duration: number) {
        this.get(playerId).raiseDuration = duration;
    }

    getRaiseDuration(playerId: string) {
        return this.get(playerId).raiseDuration;
    }

    isRaiseComplete(playerId: string, remainingCooldown: number) {
        const state = this.get(playerId);
        if (state.raiseDuration === undefined) return true;
        if (remainingCooldown > 0) return false;

        state.raiseDuration = undefined;
        this.deleteIfEmpty(playerId);
        return true;
    }

    clearRaiseDuration(playerId: string) {
        const state = this.get(playerId);
        state.raiseDuration = undefined;
        this.deleteIfEmpty(playerId);
    }

    // State Control
    cleanupPlayer(playerId: string) {
        this.clearFireCooldown(playerId);
        this.stopFiring(playerId);
        this.clearPendingReleaseFire(playerId);
        this.cancelReload(playerId);
        this.clearRaiseDuration(playerId);
        this.players.delete(playerId);
    }

    private get(playerId: string) {
        let state = this.players.get(playerId);
        if (!state) {
            state = {};
            this.players.set(playerId, state);
        }
        return state;
    }

    private deleteIfEmpty(playerId: string) {
        const state = this.players.get(playerId);
        if (!state) return;

        if (
            state.fireCooldownTaskId === undefined &&
            state.fullAutoTaskId === undefined &&
            state.pendingReleaseFire === undefined &&
            state.reloadSession === undefined &&
            state.raiseDuration === undefined
        ) {
            this.players.delete(playerId);
        }
    }
}

export const gunRuntimeState = new GunRuntimeState((taskId) => system.clearRun(taskId));
