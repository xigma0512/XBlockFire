import { MemberManager } from "../../member/MemberManager";
import { PhaseManager } from "../PhaseManager";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action";

import { RoundEndPhase } from "./RoundEnd";
import { GameOverPhase } from "./Gameover";

import { PhaseEnum as BombPlantPhaseEnum } from "../BombPlantPhaseEnum";
import { TeamEnum } from "../../member/TeamEnum";

import { set_variable } from "../../../utils/Variable";
import { MessageManager as Msg } from "../../../modules/hud/MessageManager";
import { LanguageKey } from "../../../settings/lang/LanguageKey";

import { Config } from "../../../settings/config";

const config = Config.bombplant.C4planted;

const enum EndReasonEnum {
    'Time-up' = 1,
    'Defender-Eliminated',
    'Defender-Disconnect'
};

interface EndReasonData {
    winner: TeamEnum;
    langKey: LanguageKey;
    isGameOver: boolean;
    nextPhaseGenerator: () => IPhaseHandler;
}

const endReasonTable: Record<number, EndReasonData> = {
    [EndReasonEnum['Time-up']]: {
        winner: TeamEnum.Attacker,
        langKey: "round.end.c4_detonated",
        isGameOver: false,
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Eliminated']]: {
        winner: TeamEnum.Attacker,
        langKey: "round.end.defender_eliminated",
        isGameOver: false,
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Disconnect']]: {
        winner: TeamEnum.Attacker,
        langKey: "game.over.defender_disconnect",
        isGameOver: true,
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
        if (PhaseManager.isPhaseTransitioning) return;

        let endReason: EndReasonEnum | null = null;
    
        const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });
        const defendersAlive = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });
    
        if (defendersAlive.length === 0) endReason = EndReasonEnum['Defender-Eliminated'];
        if (defenders.length === 0) endReason = EndReasonEnum['Defender-Disconnect'];
        if (this.currentTick <= 0) endReason = EndReasonEnum['Time-up'];

        if (endReason) {
            const result = endReasonTable[endReason];

            Msg.message(result.langKey);

            set_variable(`round_winner`, result.winner);
            PhaseManager.updatePhase(result.nextPhaseGenerator());
        }
    }

}
