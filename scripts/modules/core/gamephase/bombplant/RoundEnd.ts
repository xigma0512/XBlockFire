import { ActionView as ActionHud } from '../../../../ui/hud/views/ActionView';
import { MemberManager } from '../../../player/MemberManager';
import { PhaseManager } from '../PhaseManager';

import { GameOverPhase } from './Gameover';
import { PreRoundStartPhase } from './PreRoundStart';

import { TeamEnum } from '../../../player/TeamEnum';
import { PhaseEnum as BombPlantPhaseEnum } from './BombPlantPhaseEnum';

import { Sound } from '../../../../ui/media/Sound';
import { FormatCode as FC } from '../../../../utils/FormatCode';
import { Language as L } from '../../../../utils/Language';
import { set_entity_dynamic_property } from '../../../../utils/Property';
import { set_variable, variable } from '../../../../utils/Variable';

import { UiStateManager } from '../../../../ui/hud/state/UiState';
import { BombPlantConfig } from '../../gamemodes/BombPlant/BombPlantConfig';

const ROUND_END_SOUND_ID = 'mob.wolf.whine';
const SWITCH_SIDE_SOUND_ID = 'beacon.activate';
const ROUND_WIN_SOUND_ID = 'random.levelup';
const ROUND_LOSE_SOUND_ID = 'respawn_anchor.deplete';

export class RoundEndPhase implements IPhaseHandler {
    readonly phaseId = BombPlantPhaseEnum.RoundEnd;
    readonly hud: ActionHud;
    private _currentTick = BombPlantConfig.ROUND_END_TIME;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = BombPlantConfig.ROUND_END_TIME;
        processWinner();
        playRoundResultSounds();
        Sound.playTo(ROUND_END_SOUND_ID, MemberManager.getPlayers(), { pitch: 0.8, volume: 1 });
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
        if (attackerScore >= BombPlantConfig.WINNING_SCORE) winner = TeamEnum.Attacker;
        if (defenderScore >= BombPlantConfig.WINNING_SCORE) winner = TeamEnum.Defender;

        if (winner) {
            set_variable(`winner`, winner);
            PhaseManager.updatePhase(new GameOverPhase());
            return;
        }

        if (this.currentTick <= 0) {
            if (attackerScore + defenderScore == BombPlantConfig.WINNING_SCORE - 1) {
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

    Sound.playTo(SWITCH_SIDE_SOUND_ID, MemberManager.getPlayers(), { pitch: 0.8, volume: 1 });
    UiStateManager.setNotifyMessage(`${FC.Bold}${FC.Gold}<<${L.translate('game.switch_side.title')}>>`, 20 * 20);
}

function playRoundResultSounds() {
    const winnerTeam = variable(`round_winner`) as TeamEnum;
    if (winnerTeam !== TeamEnum.Attacker && winnerTeam !== TeamEnum.Defender) return;

    const loserTeam = winnerTeam === TeamEnum.Attacker ? TeamEnum.Defender : TeamEnum.Attacker;
    Sound.playTo(ROUND_WIN_SOUND_ID, MemberManager.getPlayers({ team: winnerTeam }), { pitch: 1.2, volume: 1 });
    Sound.playTo(ROUND_LOSE_SOUND_ID, MemberManager.getPlayers({ team: loserTeam }), { pitch: 0.8, volume: 1 });
}

function processWinner() {
    const winnerTeam = variable(`round_winner`) as TeamEnum;
    if (winnerTeam === TeamEnum.Attacker) {
        set_variable(`attacker_score`, (variable(`attacker_score`) || 0) + 1);
    } else if (winnerTeam === TeamEnum.Defender) {
        set_variable(`defender_score`, (variable(`defender_score`) || 0) + 1);
    }
}
