import { MemberManager } from "../../gameroom/member/MemberManager";
import { PhaseManager } from "../PhaseManager";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action";

import { RoundEndPhase } from "./RoundEnd";
import { GameOverPhase } from "./Gameover";
import { Config } from "./_config";

import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";
import { TeamEnum } from "../../../types/TeamEnum";

import { set_variable } from "../../../utils/Variable";
import { FormatCode as FC } from "../../../utils/FormatCode";
import { Broadcast } from "../../../utils/Broadcast";

const config = Config.C4planted;

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
            `${FC.Bold}${FC.Red}C4 DETONATED!\n`,
            `${FC.Bold}${FC.Green}ATTACKERS win this round!\n`,
            `${FC.Bold}${FC.Gray}---`
        ],
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Eliminated']]: {
        winner: TeamEnum.Attacker,
        message: [
            `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ ROUND END ] ${FC.Gray}----\n`,
            `${FC.Bold}${FC.Red}All DEFENDERS ELIMINATED!\n`,
            `${FC.Bold}${FC.Green}ATTACKERS WIN this round!\n`,
            `${FC.Bold}${FC.Gray}---`
        ],
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Disconnect']]: {
        winner: TeamEnum.Attacker,
        message: [
            `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ GAME OVER ] ${FC.Gray}----\n`,
            `${FC.Bold}${FC.Red}All DEFENDERS disconnected.\n`,
            `${FC.Bold}${FC.Green}ATTACKERS win this game.\n`,
            `${FC.Bold}${FC.Gray}---`
        ],
        nextPhaseGenerator: () => new GameOverPhase()
    }
}

export class C4PlantedPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.C4Planted;
    readonly hud: ActionHud;
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
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
    
        const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });
        const defendersAlive = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });
    
        if (defendersAlive.length === 0) endReason = EndReasonEnum['Defender-Eliminated'];
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