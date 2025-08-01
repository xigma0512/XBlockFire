import { Player } from "@minecraft/server";
import { VanillaEntityIdentifier, Vector3 } from "@minecraft/server";

import { BombStateManager } from "../BombStateManager";
import { MemberManager } from "../../../player/MemberManager";
import { C4IdleState } from "./Idle";
import { PickUpStrategy } from "../strategies/PickUp";

import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { lang } from "../../../../infrastructure/Language";

import { BombStateEnum } from "../../../../declarations/enum/BombStateEnum";
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";
import { GameEvent } from "../../../../infrastructure/event/GameEvent";
import { gameEvents } from "../../../../infrastructure/event/EventEmitter";

const DROPPED_C4_ENTITY_ID = 'xblockfire:dropped_c4' as VanillaEntityIdentifier;
const ROTATION_SPEED = 7.5;

export class C4DroppedState implements IBombStateHandler {

    readonly stateTag = BombStateEnum.Dropped;
    readonly strategies: IBombStateStrategy[];

    private afterC4PickedUpCallback = (ev: GameEvent['onC4PickedUp']) => { };

    constructor(private source: Player, private location: Vector3) {
        this.afterC4PickedUpCallback = gameEvents.subscribe('onC4PickedUp', this.onC4PickedUp.bind(this));

        this.strategies = [
            new PickUpStrategy
        ];
    }

    on_entry() {
        spawnC4Entity(this.source, this.location);
    }
    
    on_running() {
        const c4Entity = BombStateManager.c4Entity!;
        if (!c4Entity.isValid) {
            BombStateManager.updateState(new C4IdleState());
            return false;
        }

        const rotation = c4Entity.getRotation();
        rotation.y = (rotation.y + ROTATION_SPEED) % 360;
        c4Entity.setRotation(rotation);

        return true;
    }
    
    on_exit() {
        gameEvents.unsubscribe('onC4PickedUp', this.afterC4PickedUpCallback);
        BombStateManager.c4Entity!.remove();
    }


    private onC4PickedUp(ev: GameEvent['onC4PickedUp']) {
        const {source} = ev;
        BombStateManager.updateState(new C4IdleState);

        source.sendMessage(lang('c4.pick_up'));
        const attackers = MemberManager.getPlayers({ team: TeamEnum.Attacker });
        Broadcast.message(lang('c4.pick_up.broadcast', source.name), attackers);
    }

}

function spawnC4Entity(source: Player, location: Vector3) {
    const {dimension} = source;
    const entity = dimension.spawnEntity(DROPPED_C4_ENTITY_ID, location);
    BombStateManager.c4Entity = entity;

    const attackers = MemberManager.getPlayers({team: TeamEnum.Attacker});
    Broadcast.message(lang('c4.drop'), attackers);
}