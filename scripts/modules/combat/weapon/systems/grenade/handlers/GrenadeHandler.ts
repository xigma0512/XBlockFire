import { Sound } from '../../../../../../ui/media/Sound';
import { EntityActor } from '../../../actors/Actor';
import { GrenadeSystem } from '../GrenadeSystem';

import { system } from '@minecraft/server';

export abstract class GrenadeHandler {
    readonly entityActor: EntityActor;

    constructor(actor: EntityActor) {
        this.entityActor = actor;
        this.spawn();
    }

    spawn() {
        if (this.entityActor.hasComponent('grenade')) {
            const grenadeComp = this.entityActor.getComponent('grenade')!;

            const entity = this.entityActor.entity;
            if (grenadeComp.throwing_sound) {
                Sound.playAt(grenadeComp.throwing_sound, entity.dimension, entity.location, { volume: 3 });
            }
        }
    }

    execute() {
        if (this.entityActor.hasComponent('grenade')) {
            const grenadeComp = this.entityActor.getComponent('grenade')!;

            const entity = this.entityActor.entity;
            if (grenadeComp.explode_sound) {
                Sound.playAt(grenadeComp.explode_sound, entity.dimension, entity.location, { volume: 5 });
            }

            system.runTimeout(() => {
                GrenadeSystem.removeHandler(entity);
                entity.remove();
            }, 3);
        }
    }
}
