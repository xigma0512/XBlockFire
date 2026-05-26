import { PhaseManager } from "../PhaseManager";
import { MemberManager } from "../../../player/MemberManager";
import { ActionHud } from "../../../../ui/huds/Action";

import { TeamEnum } from "../../../player/TeamEnum";
import { PhaseEnum } from "../BombPlantPhaseEnum";

import { set_variable } from "../../../../utils/Variable";
import { MessageManager as Msg } from "../../../../ui/Message";
import { Language as L } from "../../../../utils/Language";
import { LanguageKey } from "../../../../settings/lang/LanguageKey";

import { Config } from "../../../../settings/config";

const c4_config = Config.bombplant.C4planted;

const enum EndReasonEnum {
    'Time-up' = 1,
    'Defender-Eliminated',
    'Defender-Disconnect'
};

interface EndReasonData {
    winner: TeamEnum;
    langKey: LanguageKey;
    nextPhaseGenerator: () => IPhaseHandler;
}

// These would normally lead to RoundEndPhase
import { RoundEndPhase } from "./RoundEnd";
import { GameOverPhase } from "./Gameover";

const endReasonTable: Record<number, EndReasonData> = {
    [EndReasonEnum['Time-up']]: {
        winner: TeamEnum.Attacker,
        langKey: "round.end.c4_detonated", 
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Eliminated']]: {
        winner: TeamEnum.Attacker,
        langKey: "round.end.defender_eliminated",
        nextPhaseGenerator: () => new RoundEndPhase()
    },
    [EndReasonEnum['Defender-Disconnect']]: {
        winner: TeamEnum.Attacker,
        langKey: "game.over.defender_disconnect",
        nextPhaseGenerator: () => new GameOverPhase()
    }
}

export class C4PlantedPhase implements IPhaseHandler {
    
    readonly phaseTag = PhaseEnum.C4Planted;
    readonly hud: ActionHud;

    private _currentTick: number;
    get currentTick() { return this._currentTick; }

    constructor() {
        this.hud = new ActionHud();
        this._currentTick = c4_config.COUNTDOWN_TIME;
    }

    on_entry() { }

    on_exit() { }

    on_running() {
        this._currentTick--;
        this.hud.update();

        this.checkGameover();
    }

    private checkGameover() {
        if (PhaseManager.isPhaseTransitioning) return;

        let endReason: EndReasonEnum | null = null;
    
        const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });
        const defendersAlive = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });
    
        if (defendersAlive.length === 0) endReason = EndReasonEnum['Defender-Eliminated'];
        if (defenders.length === 0) endReason = EndReasonEnum['Defender-Disconnect'];
        if (this.currentTick <= 0) endReason = EndReasonEnum['Time-up'];

        if (endReason) {
            const result = endReasonTable[endReason];

            Msg.message(L.translate(result.langKey));

            set_variable(`round_winner`, result.winner);
            PhaseManager.updatePhase(result.nextPhaseGenerator());
        }
    }
}
