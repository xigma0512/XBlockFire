import { EntityActor } from '../../../actors/Actor';
import { GrenadeHandler } from './GrenadeHandler';

export class IncendiaryGrenadeHandler extends GrenadeHandler {
    private hasTriggered: boolean = false;

    constructor(actor: EntityActor) {
        super(actor);
    }

    trigger() {
        if (this.hasTriggered) return;
        this.hasTriggered = true;

        // TODO: AreaEffectSystem.createFireArea()

        super.execute();
    }
}
