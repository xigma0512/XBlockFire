import { EntityHitEntityAfterEvent, ItemStack, Player, world } from "@minecraft/server";

import { BombStateManager } from "../BombStateManager";
import { MemberManager } from "../../../player/MemberManager";

import { TeamEnum } from "../../../../declarations/enum/TeamEnum";
import { gameEvents } from "../../../../infrastructure/event/EventEmitter";

const C4_ITEM_ID = 'xblockfire:c4';

export class PickUpStrategy implements IBombStateStrategy {
    
    private afterEntityHitEntityCallback = (ev: EntityHitEntityAfterEvent) =>  { };

    initialize(){
        this.afterEntityHitEntityCallback = world.afterEvents.entityHitEntity.subscribe(this.onEntityHitEntity);
    }

    dispose() {
        world.afterEvents.entityHitEntity.unsubscribe(this.afterEntityHitEntityCallback);    
    }


    private onEntityHitEntity(ev: EntityHitEntityAfterEvent) {
        const c4Entity = BombStateManager.c4Entity!;
        if (ev.hitEntity.id !== c4Entity.id) return;

        playerPickUpC4(ev.damagingEntity as Player);
    }

}

function playerPickUpC4(source: Player) {
    const playerTeam = MemberManager.getPlayerTeam(source);
    if (playerTeam !== TeamEnum.Attacker) return;
    
    source.getComponent('inventory')?.container.setItem(3, new ItemStack(C4_ITEM_ID));
    gameEvents.emit('onC4PickedUp', { source });
}