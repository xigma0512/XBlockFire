import { MemberManager } from "../../../player/MemberManager";
import { GamePhaseManager } from "../GamePhaseManager";

import { GameOverPhase } from "./Gameover";
import { RoundEndPhase } from "./RoundEnd";
import { ActionHud } from "../../../../interface/hud/ingame/bomb_plant/Action";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum"
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { set_variable } from "../../../../infrastructure/data/Variable";
import { lang } from "../../../../infrastructure/Language";

import { BombPlant as Config } from "../../../../settings/config";

const VOICE_30_SEC_LEFT_SOUND_ID = 'xblockfire.30_sec_left';

const enum EndReasonEnum {
    'Time-up' = 1,
    'Attacker-Eliminated',
    'Attacker-Disconnect',
    'Defender-Eliminated',
    'Defender-Disconnect'
};

const endReasonTable = {
    [EndReasonEnum['Time-up']]: {
        winner: TeamEnum.Defender,
        message: lang('game.bombplant.action.time_up'),
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Attacker-Eliminated']]: {
        winner: TeamEnum.Defender,
        message: lang('game.bombplant.action.attacker_eliminated'),
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Attacker-Disconnect']]: {
        winner: TeamEnum.Defender,
        message: lang('game.bombplant.action.attacker_disconnect'),
        nextPhaseGenerator: () => new GameOverPhase()
    },
    [EndReasonEnum['Defender-Eliminated']]: {
        winner: TeamEnum.Attacker,
        message: lang('game.bombplant.action.defender_eliminated'),
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Disconnect']]: {
        winner: TeamEnum.Attacker,
        message: lang('game.bombplant.action.defender_disconnect'),
        nextPhaseGenerator: () => new GameOverPhase()
    }
}

export class ActionPhase implements IPhaseHandler {

    readonly phaseTag;
    readonly hud;

    constructor() {
        this.phaseTag = BombPlantPhaseEnum.Action;
        this.hud = new ActionHud();
        GamePhaseManager.currentTick = Config.phaseTime.action;
    }

    on_entry() {
    }

    on_running() {
        const currentTick = GamePhaseManager.currentTick;
        if (currentTick === 30 * 20) {
            Broadcast.sound(VOICE_30_SEC_LEFT_SOUND_ID, {});
        }
        return true;
    }
    
    on_exit() {
    }

    transitions() {
        const currentTick = GamePhaseManager.currentTick;
        let endReason: EndReasonEnum | null = null;

        const attackers = MemberManager.getPlayers({ team: TeamEnum.Attacker });
        const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });

        const attackersAlive = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: true });
        const defendersAlive = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });

        if (attackersAlive.length === 0) endReason = EndReasonEnum['Attacker-Eliminated'];
        if (defendersAlive.length === 0) endReason = EndReasonEnum['Defender-Eliminated'];
        if (attackers.length === 0) endReason = EndReasonEnum['Attacker-Disconnect'];
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