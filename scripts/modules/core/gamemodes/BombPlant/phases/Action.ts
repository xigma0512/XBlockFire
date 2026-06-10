import { MemberManager } from '../../../../player/MemberManager';
import { PhaseManager } from '../../../gamephase/PhaseManager';

import { GameOverPhase } from './Gameover';
import { RoundEndPhase } from './RoundEnd';
import { ActionView as ActionHud } from '../../../../../ui/hud/views/ActionView';

import { PhaseEnum as BombPlantPhaseEnum } from './BombPlantPhaseEnum';
import { TeamEnum } from '../../../../player/TeamEnum';

import { Sound } from '../../../../../ui/media/Sound';
import { UiStateManager } from '../../../../../ui/hud/state/UiState';
import { set_variable } from '../../../../../utils/Variable';
import { LanguageKey } from '../../../../../types/Language';

import { BombPlantConfig } from '../BombPlantConfig';

const THIRTY_SEC_LEFT_SOUND_ID = 'xblockfire.30_sec_left';

const enum EndReasonEnum {
    'Time-up' = 1,
    'Attacker-Eliminated',
    'Attacker-Disconnect',
    'Defender-Eliminated',
    'Defender-Disconnect',
}

interface EndReasonData {
    winner: TeamEnum;
    isGameOver: boolean;
    nextPhaseGenerator: () => IPhaseHandler;
}

const endReasonTable: Record<number, EndReasonData> = {
    [EndReasonEnum['Time-up']]: {
        winner: TeamEnum.Defender,
        isGameOver: false,
        nextPhaseGenerator: () => new RoundEndPhase(),
    },
    [EndReasonEnum['Attacker-Eliminated']]: {
        winner: TeamEnum.Defender,
        isGameOver: false,
        nextPhaseGenerator: () => new RoundEndPhase(),
    },
    [EndReasonEnum['Attacker-Disconnect']]: {
        winner: TeamEnum.Defender,
        isGameOver: true,
        nextPhaseGenerator: () => new GameOverPhase(),
    },
    [EndReasonEnum['Defender-Eliminated']]: {
        winner: TeamEnum.Attacker,
        isGameOver: false,
        nextPhaseGenerator: () => new RoundEndPhase(),
    },
    [EndReasonEnum['Defender-Disconnect']]: {
        winner: TeamEnum.Attacker,
        isGameOver: true,
        nextPhaseGenerator: () => new GameOverPhase(),
    },
};

export class ActionPhase implements IPhaseHandler {
    readonly phaseId = BombPlantPhaseEnum.Action;
    readonly hud: ActionHud;

    private _currentTick: number = BombPlantConfig.ACTION_TIME;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = BombPlantConfig.ACTION_TIME;
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

            UiStateManager.setRoundEndMessage(result.winner, result.isGameOver);

            set_variable(`round_winner`, result.winner);
            if (result.isGameOver) set_variable(`winner`, result.winner);
            PhaseManager.updatePhase(result.nextPhaseGenerator());
        }
    }
}

function voiceBroadcast(currentTick: number) {
    if (currentTick === 30 * 20) {
        Sound.playTo(THIRTY_SEC_LEFT_SOUND_ID, MemberManager.getPlayers());
    }
}
