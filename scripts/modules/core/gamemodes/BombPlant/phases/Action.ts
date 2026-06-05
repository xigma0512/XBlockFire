import { MemberManager } from '../../../../player/MemberManager';
import { PhaseManager } from '../../../gamephase/PhaseManager';

import { GameOverPhase } from './Gameover';
import { RoundEndPhase } from './RoundEnd';
import { ActionView as ActionHud } from '../../../../../ui/hud/views/ActionView';

import { PhaseEnum as BombPlantPhaseEnum } from './BombPlantPhaseEnum';
import { TeamEnum } from '../../../../player/TeamEnum';

import { HudDriver } from '../../../../../ui/hud/drivers/HudDriver';
import { Sound } from '../../../../../ui/media/Sound';
import { UiStateManager } from '../../../../../ui/hud/state/UiState';
import { Language as L } from '../../../../../utils/Language';
import { set_variable } from '../../../../../utils/Variable';
import { LanguageKey } from '../../../../../types/Language';

const ACTION_TIME = 120 * 20;

const enum EndReasonEnum {
    'Time-up' = 1,
    'Attacker-Eliminated',
    'Attacker-Disconnect',
    'Defender-Eliminated',
    'Defender-Disconnect',
}

interface EndReasonData {
    winner: TeamEnum;
    langKey: LanguageKey;
    isGameOver: boolean;
    nextPhaseGenerator: () => IPhaseHandler;
}

const endReasonTable: Record<number, EndReasonData> = {
    [EndReasonEnum['Time-up']]: {
        winner: TeamEnum.Defender,
        langKey: 'round.end.time_up',
        isGameOver: false,
        nextPhaseGenerator: () => new RoundEndPhase(),
    },
    [EndReasonEnum['Attacker-Eliminated']]: {
        winner: TeamEnum.Defender,
        langKey: 'round.end.attacker_eliminated',
        isGameOver: false,
        nextPhaseGenerator: () => new RoundEndPhase(),
    },
    [EndReasonEnum['Attacker-Disconnect']]: {
        winner: TeamEnum.Defender,
        langKey: 'game.over.attacker_disconnect',
        isGameOver: true,
        nextPhaseGenerator: () => new GameOverPhase(),
    },
    [EndReasonEnum['Defender-Eliminated']]: {
        winner: TeamEnum.Attacker,
        langKey: 'round.end.defender_eliminated',
        isGameOver: false,
        nextPhaseGenerator: () => new RoundEndPhase(),
    },
    [EndReasonEnum['Defender-Disconnect']]: {
        winner: TeamEnum.Attacker,
        langKey: 'game.over.defender_disconnect',
        isGameOver: true,
        nextPhaseGenerator: () => new GameOverPhase(),
    },
};

export class ActionPhase implements IPhaseHandler {
    readonly phaseId = BombPlantPhaseEnum.Action;
    readonly hud: ActionHud;

    private _currentTick: number = ACTION_TIME;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = ACTION_TIME;
    }

    on_running() {
        this._currentTick--;
        voiceBroadcast(this.currentTick);
        this.hud.update();
        this.transitions();
    }

    on_exit() {}

    private transitions() {
        if (PhaseManager.isPhaseTransitioning) return;

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

            HudDriver.chat(L.translate(result.langKey));
            UiStateManager.setRoundEndMessage(result.winner);

            set_variable(`round_winner`, result.winner);
            PhaseManager.updatePhase(result.nextPhaseGenerator());
        }
    }
}

function voiceBroadcast(currentTick: number) {
    if (currentTick === 30 * 20) {
        Sound.play('THIRTY_SEC_LEFT', MemberManager.getPlayers(), {});
    }
}
