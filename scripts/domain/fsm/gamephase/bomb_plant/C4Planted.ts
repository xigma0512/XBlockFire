import { MemberManager } from "../../../player/MemberManager";
import { GamePhaseManager } from "../GamePhaseManager";
import { ActionHud } from "../../../../interface/hud/ingame/bomb_plant/Action";

import { RoundEndPhase } from "./RoundEnd";
import { GameOverPhase } from "./Gameover";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

import { set_variable } from "../../../../infrastructure/data/Variable";
import { FormatCode as FC } from "../../../../declarations/enum/FormatCode";
import { Broadcast } from "../../../../infrastructure/utils/Broadcast";

import { Config } from "../../../../settings/config";

const config = Config.bombplant.C4planted;

const enum EndReasonEnum {
    'Time-up' = 1,
    'Defender-Eliminated',
    'Defender-Disconnect'
};

const endReasonTable = {
    [EndReasonEnum['Time-up']]: {
        winner: TeamEnum.Attacker,
        message: [
            `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ ROUND END ] ${FC.Gray}----\n`,
            `${FC.Bold}${FC.Red}C4 Detonated!\n`,
            `${FC.Bold}${FC.Green}Attackers win this round!\n`,
            `${FC.Bold}${FC.Gray}--------------------`
        ],
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Eliminated']]: {
        winner: TeamEnum.Attacker,
        message: [
            `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ ROUND END ] ${FC.Gray}----\n`,
            `${FC.Bold}${FC.Red}All Defenders Eliminated!\n`,
            `${FC.Bold}${FC.Green}Attackers win this round!\n`,
            `${FC.Bold}${FC.Gray}--------------------`
        ],
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Disconnect']]: {
        winner: TeamEnum.Attacker,
        message: [
            `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ GAME OVER ] ${FC.Gray}----\n`,
            `${FC.Bold}${FC.Red}All Defenders disconnected.\n`,
            `${FC.Bold}${FC.Yellow}Attacker win.\n`,
            `${FC.Bold}${FC.Gray}--------------------`
        ],
        nextPhaseGenerator: () => new GameOverPhase()
    }
}

export class C4PlantedPhase implements IPhaseHandler {

    readonly phaseTag;
    readonly hud;

    constructor() {
        this.phaseTag = BombPlantPhaseEnum.C4Planted;
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
    }

    on_running() {
        this._currentTick --;
    }

    on_exit() {
    }

    private transitions() {

        let endReason: EndReasonEnum | null = null;
    
        const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });
        const defendersAlive = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });
    
        if (defendersAlive.length === 0) endReason = EndReasonEnum['Defender-Eliminated'];
        if (defenders.length === 0) endReason = EndReasonEnum['Defender-Disconnect'];
        if (this.currentTick <= 0) endReason = EndReasonEnum['Time-up'];

        if (endReason) {
            const result = endReasonTable[endReason];

            Broadcast.message(result.message);

            set_variable(`round_winner`, result.winner);
            GamePhaseManager.updatePhase(result.nextPhaseGenerator());
        }
    }

}