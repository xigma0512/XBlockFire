import { EntityActor } from './actors/EntityActor';
import { ItemActor } from './actors/item/ItemActor';

export type GunReloadStateEnum = 'idle' | 'pre_reload' | 'reloading' | 'success' | 'fail';

export type ActorType = EntityActor | ItemActor;

export type ClearRun = (taskId: number) => void;

export interface PendingReleaseFire {
    triggerTick: number;
    clearRun: ClearRun;
}

export interface ReloadSession {
    reloadTaskId: number;
    clearRun: ClearRun;
    finishTick: number;
    ammoToAdd: number;
}
