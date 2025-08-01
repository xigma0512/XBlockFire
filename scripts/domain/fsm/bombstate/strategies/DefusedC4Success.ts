import { Player } from "@minecraft/server";

import { RoundEndPhase } from "../../gamephase/bomb_plant/RoundEnd";
import { GamePhaseManager } from "../../gamephase/GamePhaseManager";
import { BombStateManager } from "../BombStateManager";
import { C4IdleState } from "../states/Idle";

import { set_variable } from "../../../../infrastructure/data/Variable";
import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { lang } from "../../../../infrastructure/Language";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

const COMPLETE_DEFUSED_SOUND = 'xblockfire.c4_defused';

export class DefusedC4SuccessStrategy implements IBombStateStrategy {

    constructor(private source: Player) { }

    initialize() {
        updateStates();
        broadcastInfomations(this.source);
    }

    dispose() { }

}

function updateStates() {
    const phase = GamePhaseManager.phaseHandler;
    const phaseTag = phase.phaseTag;
    if (phaseTag === BombPlantPhaseEnum.C4Planted) {
        set_variable(`round_winner`, TeamEnum.Defender);
        GamePhaseManager.updatePhase(new RoundEndPhase());
    }

    BombStateManager.updateState(new C4IdleState());
}

function broadcastInfomations(source: Player) {
    const message = lang('game.bombplant.c4_defused.defender_win', source.name);
    Broadcast.message(message);
    Broadcast.sound(COMPLETE_DEFUSED_SOUND, {});
}