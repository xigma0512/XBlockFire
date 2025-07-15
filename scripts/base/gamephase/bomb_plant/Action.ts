import { MemberManager } from "../../gameroom/member/MemberManager";
import { PhaseManager } from "../PhaseManager";

import { GameOverPhase } from "./Gameover";
import { RoundEndPhase } from "./RoundEnd";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action";
import { Config } from "./_config";

import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum"
import { TeamEnum } from "../../../types/TeamEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { Broadcast } from "../../../utils/Broadcast";
import { set_variable } from "../../../utils/Variable";

const config = Config.action;

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
        message: [
            `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ ROUND END ] ${FC.Gray}----\n`,
            `${FC.Bold}${FC.Red}Attackers ran out of time.\n`,
            `${FC.Bold}${FC.Green}Defenders win this round.\n`,
            `${FC.Bold}${FC.Gray}---`
        ],
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Attacker-Eliminated']]: {
        winner: TeamEnum.Defender,
        message: [
            `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ ROUND END ] ${FC.Gray}----\n`,
            `${FC.Bold}${FC.Red}All Attackers Eliminated.\n`,
            `${FC.Bold}${FC.Green}Defenders win this round.\n`,
            `${FC.Bold}${FC.Gray}---`
        ],
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Attacker-Disconnect']]: {
        winner: TeamEnum.Defender,
        message: [
            `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ GAME OVER ] ${FC.Gray}----\n`,
            `${FC.Bold}${FC.Red}All Attackers Disconnected.\n`,
            `${FC.Bold}${FC.Yellow}Defenders win\n`,
            `${FC.Bold}${FC.Gray}---`
        ],
        nextPhaseGenerator: () => new GameOverPhase()
    },
    [EndReasonEnum['Defender-Eliminated']]: {
        winner: TeamEnum.Attacker,
        message: [
            `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ ROUND END ] ${FC.Gray}----\n`,
            `${FC.Bold}${FC.Red}Defenders Eliminated.\n`,
            `${FC.Bold}${FC.Green}Attackers win this round.\n`,
            `${FC.Bold}${FC.Gray}---`
        ],
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Disconnect']]: {
        winner: TeamEnum.Attacker,
        message: [
            `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ GAME OVER ] ${FC.Gray}----\n`,
            `${FC.Bold}${FC.Red}All Defenders Disconnected.\n`,
            `${FC.Bold}${FC.Yellow}Attackers win.\n`,
            `${FC.Bold}${FC.Gray}---`
        ],
        nextPhaseGenerator: () => new GameOverPhase()
    }
}

export class ActionPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.Action;
    readonly hud: ActionHud;
    
    private _currentTick: number = config.ACTION_TIME;
    get currentTick() { return this._currentTick; }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = config.ACTION_TIME;
    }

    on_running() {
        this._currentTick --;
        this.hud.update();
        this.transitions();
    }
    
    on_exit() {
    }

    private transitions() {
        let endReason: EndReasonEnum | null = null;

        const attackers = MemberManager.getPlayers({ team: TeamEnum.Attacker });
        const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });

        const attackersAlive = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: true });
        const defendersAlive = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });

        if (attackersAlive.length === 0) endReason = EndReasonEnum['Attacker-Eliminated'];
        if (defendersAlive.length === 0) endReason = EndReasonEnum['Defender-Eliminated'];
        if (attackers.length === 0) endReason = EndReasonEnum['Attacker-Disconnect'];
        if (defenders.length === 0) endReason = EndReasonEnum['Defender-Disconnect'];
        if (this.currentTick <= 0) endReason = EndReasonEnum['Time-up'];
    
        if (endReason) {
            const result = endReasonTable[endReason];

            Broadcast.message(result.message);

            set_variable(`round_winner`, result.winner);
            PhaseManager.updatePhase(result.nextPhaseGenerator());
        }
    }

}