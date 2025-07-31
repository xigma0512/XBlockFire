import { MemberManager } from "../../../player/MemberManager";
import { GamePhaseManager } from "../GamePhaseManager";
import { ActionHud } from "../../../../interface/hud/ingame/bomb_plant/Action";

import { RoundEndPhase } from "./RoundEnd";
import { GameOverPhase } from "./Gameover";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

import { set_variable } from "../../../../infrastructure/data/Variable";
import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { lang } from "../../../../infrastructure/Language";

import { BombPlant as Config } from "../../../../settings/config";

const enum EndReasonEnum {
    'Time-up' = 1,
    'Defender-Eliminated',
    'Defender-Disconnect'
};

const endReasonTable = {
    [EndReasonEnum['Time-up']]: {
        winner: TeamEnum.Attacker,
        message: lang('game.bombplant.c4planted.time_up'),
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Eliminated']]: {
        winner: TeamEnum.Attacker,
        message: lang('game.bombplant.c4planted.defender_eliminated'),
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Disconnect']]: {
        winner: TeamEnum.Attacker,
        message: lang('game.bombplant.c4planted.defender_disconnect'),
        nextPhaseGenerator: () => new GameOverPhase()
    }
}

export class C4PlantedPhase implements IPhaseHandler {

    readonly phaseTag;
    readonly hud;

    constructor() {
        this.phaseTag = BombPlantPhaseEnum.C4Planted;
        this.hud = new ActionHud();
        GamePhaseManager.currentTick = Config.phaseTime.c4planted;
    }

    on_entry() {
    }

    on_running() {
        return true;
    }

    on_exit() {
    }

    transitions() {
        const currentTick = GamePhaseManager.currentTick;
        let endReason: EndReasonEnum | null = null;
    
        const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });
        const defendersAlive = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });
    
        if (defendersAlive.length === 0) endReason = EndReasonEnum['Defender-Eliminated'];
        if (defenders.length === 0) endReason = EndReasonEnum['Defender-Disconnect'];
        if (currentTick <= 0) endReason = EndReasonEnum['Time-up'];

        if (endReason) {
            const result = endReasonTable[endReason];

            Broadcast.message(result.message);

            set_variable(`round_winner`, result.winner);
            GamePhaseManager.updatePhase(result.nextPhaseGenerator());
        }
    }

}