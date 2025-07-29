import { PhaseManager } from "../../gamephase/PhaseManager";
import { MemberManager } from "../../member/MemberManager";
import { C4Manager } from "../C4Manager";
import { HudTextController } from "../../../interface/hud/HudTextController";

import { C4PlantedState } from "./Planted";
import { C4IdleState } from "./Idle";

import { C4StateEnum } from "../../../shared/types/bombstate/C4StateEnum";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../shared/types/gamephase/BombPlantPhaseEnum";
import { Broadcast } from "../../../shared/utils/Broadcast";
import { progressBar } from "../../../shared/utils/others/Format";

import { ItemCompleteUseAfterEvent, ItemStopUseAfterEvent } from "@minecraft/server";
import { Player, world } from "@minecraft/server";

const C4_ITEM_ID = 'xblockfire:c4';
const C4_PLANTING_TIME = 4 * 20;

const C4_PLANTED_SOUND_ID = 'xblockfire.c4_planted';
const PLANTING_SELF_SOUND_ID = 'xblockfire.planting.self';
const PLANTING_BROADCAST_SOUND_ID = 'xblockfire.planting.broadcast'

export class C4PlantingState implements IC4StateHandler {
    
    readonly stateTag = C4StateEnum.Planting;

    private afterItemCompleteUseListener = (ev: ItemCompleteUseAfterEvent) => { };
    private afterItemStopUseListener = (ev: ItemStopUseAfterEvent) => { };

    private currentTime = C4_PLANTING_TIME;

    constructor(
        private readonly source: Player
    ) { }

    on_entry() {
        this.afterItemCompleteUseListener = world.afterEvents.itemCompleteUse.subscribe(this.onItemCompleteUse.bind(this));
        this.afterItemStopUseListener = world.afterEvents.itemStopUse.subscribe(this.onItemStopUse.bind(this));
        
        playPlantingSound(this.source);
    }

    on_running() {
        const progress = progressBar(C4_PLANTING_TIME, this.currentTime--, 30);
        HudTextController.add(this.source, 'actionbar', progress);
    }

    on_exit() {
        world.afterEvents.itemCompleteUse.unsubscribe(this.afterItemCompleteUseListener);
        world.afterEvents.itemStopUse.unsubscribe(this.afterItemStopUseListener);
    }


    private onItemCompleteUse(ev: ItemCompleteUseAfterEvent) {
        if (ev.itemStack.typeId !== C4_ITEM_ID) return;
        if (ev.source.id !== this.source.id) return;

        const phase = PhaseManager.getPhase();
        if (phase.phaseTag !== BombPlantPhaseEnum.Action && phase.phaseTag !== BombPlantPhaseEnum.RoundEnd) return;
        
        // eslint-disable-next-line
        ev.source.runCommand('clear @s xblockfire:c4');
        const players = MemberManager.getPlayers();
        Broadcast.sound(C4_PLANTED_SOUND_ID, {}, players);

        const dimension = ev.source.dimension;
        const location = ev.source.location;
        C4Manager.updateState(new C4PlantedState({ dimension, ...location }));
    }

    private onItemStopUse(ev: ItemStopUseAfterEvent) {
        if (!ev.itemStack || ev.itemStack.typeId !== C4_ITEM_ID) return;
        if (ev.source.id !== this.source.id) return;

        C4Manager.updateState(new C4IdleState());
        
        ev.source.stopSound(PLANTING_SELF_SOUND_ID);
    }

}

function playPlantingSound(source: Player) {
    const players = world.getPlayers({excludeNames: [ source.name ]});
    Broadcast.sound(PLANTING_BROADCAST_SOUND_ID, { location: source.location, volume: 3 }, players);
    source.playSound(PLANTING_SELF_SOUND_ID);
}