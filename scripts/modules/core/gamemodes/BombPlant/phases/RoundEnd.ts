import { MemberManager } from '../../../../player/MemberManager';
import { PhaseManager } from '../../../gamephase/PhaseManager';
import { ActionView as ActionHud } from '../../../../../ui/hud/views/ActionView';

import { GameOverPhase } from './Gameover';
import { PreRoundStartPhase } from './PreRoundStart';

import { PhaseEnum as BombPlantPhaseEnum } from './BombPlantPhaseEnum';
import { TeamEnum } from '../../../../player/TeamEnum';

import { set_entity_dynamic_property } from '../../../../../utils/Property';
import { set_variable, variable } from '../../../../../utils/Variable';
import { Sound } from '../../../../../ui/media/Sound';
import { Language as L } from '../../../../../utils/Language';
import { FormatCode as FC } from '../../../../../utils/FormatCode';

import { UiStateManager } from '../../../../../ui/hud/state/UiState';

const COUNTDOWN_TIME = 6 * 20;
const WINNING_SCORE = 7;

export class RoundEndPhase implements IPhaseHandler {
    readonly phaseId = BombPlantPhaseEnum.RoundEnd;
    readonly hud: ActionHud;
    private _currentTick = COUNTDOWN_TIME;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = COUNTDOWN_TIME;
        processWinner();
        playRoundResultSounds();
        Sound.play('ROUND_END', MemberManager.getPlayers());
    }

    on_running() {
        this._currentTick--;
        this.hud.update();
        this.transitions();
    }

    on_exit() {}

    private transitions() {
        const attackerScore = variable(`attacker_score`);
        const defenderScore = variable(`defender_score`);

        let winner = null;
        if (attackerScore >= WINNING_SCORE) winner = TeamEnum.Attacker;
        if (defenderScore >= WINNING_SCORE) winner = TeamEnum.Defender;

        if (winner) {
            set_variable(`winner`, winner);
            PhaseManager.updatePhase(new GameOverPhase());
            return;
        }

        if (this.currentTick <= 0) {
            if (attackerScore + defenderScore == WINNING_SCORE - 1) {
                switchSide();
            }

            PhaseManager.updatePhase(new PreRoundStartPhase());
        }
    }
}

function switchSide() {
    for (const player of MemberManager.getPlayers()) {
        const playerTeam = MemberManager.getPlayerTeam(player);
        MemberManager.setPlayerTeam(player, playerTeam === TeamEnum.Attacker ? TeamEnum.Defender : TeamEnum.Attacker);
        // clear players inventory
        set_entity_dynamic_property(player, 'player:is_alive', false);
    }

    const attacker_score = variable(`attacker_score`);
    const defender_score = variable(`defender_score`);

    set_variable(`attacker_score`, defender_score);
    set_variable(`defender_score`, attacker_score);

    Sound.play('SWITCH_SIDE', MemberManager.getPlayers(), {});
    UiStateManager.setNotifyMessage(`${FC.Bold}${FC.Gold}<<${L.translate('game.switch_side.title')}>>`, 20 * 20);
}

function playRoundResultSounds() {
    const winnerTeam = variable(`round_winner`) as TeamEnum;
    if (winnerTeam !== TeamEnum.Attacker && winnerTeam !== TeamEnum.Defender) return;

    const loserTeam = winnerTeam === TeamEnum.Attacker ? TeamEnum.Defender : TeamEnum.Attacker;
    Sound.play('ROUND_WIN', MemberManager.getPlayers({ team: winnerTeam }), {});
    Sound.play('ROUND_LOSE', MemberManager.getPlayers({ team: loserTeam }), {});
}

function processWinner() {
    const winnerTeam = variable(`round_winner`) as TeamEnum;
    if (winnerTeam === TeamEnum.Attacker) {
        set_variable(`attacker_score`, (variable(`attacker_score`) || 0) + 1);
    } else if (winnerTeam === TeamEnum.Defender) {
        set_variable(`defender_score`, (variable(`defender_score`) || 0) + 1);
    }
}
