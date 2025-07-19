import { MemberManager } from "../../member/MemberManager";
import { EconomyManager } from "../../economy/EconomyManager";
import { PhaseManager } from "../PhaseManager";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action"; 

import { GameOverPhase } from "./Gameover";
import { PreRoundStartPhase } from "./PreRoundStart";

import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";
import { TeamEnum } from "../../../types/TeamEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../../utils/Property";
import { set_variable, variable } from "../../../utils/Variable";
import { Broadcast } from "../../../utils/Broadcast";

import { bombplant } from "../../../config";

const config = bombplant.roundEnd;

export class RoundEndPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.RoundEnd;
    readonly hud: ActionHud;
    private _currentTick = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        processWinner();
    }

    on_running() {        
        if (this._currentTick-- % 20 == 0) {
            Broadcast.sound("firework.launch", {}, MemberManager.getPlayers());
        }
        this.hud.update();
        this.transitions();
    }

    on_exit() {
    }

    private transitions() {
        const attackerScore = variable(`attacker_score`);
        const defenderScore = variable(`defender_score`);

        let winner = null;
        if (attackerScore >= config.WINNING_SCORE) winner = TeamEnum.Attacker;
        if (defenderScore >= config.WINNING_SCORE) winner = TeamEnum.Defender;

        if (winner) {
            set_variable(`winner`, winner);
            PhaseManager.updatePhase(new GameOverPhase());
            return;
        }

        if (this.currentTick <= 0) {
            
            if (attackerScore + defenderScore == config.WINNING_SCORE - 1) {
                switchSide();
            }
            
            PhaseManager.updatePhase(new PreRoundStartPhase());
        }
    }

}

function switchSide() {
    for (const player of MemberManager.getPlayers()) {
        const playerTeam = entity_dynamic_property(player, 'player:team');
        set_entity_dynamic_property(player, 'player:team', (playerTeam === TeamEnum.Attacker) ? TeamEnum.Defender : TeamEnum.Attacker);
    
        // reset player money
        EconomyManager.setMoney(player, 800);
        // clear players inventory
        set_entity_dynamic_property(player, 'player:is_alive', false);
    }

    const attacker_score = variable(`attacker_score`);
    const defender_score = variable(`defender_score`);

    set_variable(`attacker_score`, defender_score);
    set_variable(`defender_score`, attacker_score);

    Broadcast.message([
        `${FC.Bold}${FC.White}--- --- ---`,
        `${FC.Bold}${FC.Yellow}- Switch Side -`,
        `${FC.Bold}${FC.White}--- --- ---`,
    ], MemberManager.getPlayers());
}

function processWinner() {
    const winnerTeam = variable(`round_winner`) as TeamEnum;
    if (winnerTeam === TeamEnum.Attacker) {
        set_variable(`attacker_score`, variable(`attacker_score`) + 1);
    } else if (winnerTeam === TeamEnum.Defender) { 
        set_variable(`defender_score`, variable(`defender_score`) + 1);
    }

    for (const player of MemberManager.getPlayers()) {
        const playerTeam = entity_dynamic_property(player, 'player:team');
        const earn = config.INCOME[(playerTeam === winnerTeam) ? 0 : 1];
        EconomyManager.modifyMoney(player, earn);
        player.sendMessage(`${FC.Gray}>> ${FC.DarkGray}Round Income: +${earn}`);
    }
}