import { MemberManager } from "../../../player/MemberManager";
import { EconomyManager } from "../../../economy/EconomyManager";
import { GamePhaseManager } from "../GamePhaseManager";
import { GameOverPhase } from "./Gameover";
import { PreRoundStartPhase } from "./PreRoundStart";

import { ActionHud } from "../../../../interface/hud/ingame/bomb_plant/Action"; 

import { set_entity_dynamic_property } from "../../../../infrastructure/data/Property";
import { set_variable, variable } from "../../../../infrastructure/data/Variable";
import { Broadcast } from "../../../../infrastructure/utils/Broadcast";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";
import { FormatCode as FC } from "../../../../declarations/enum/FormatCode";

import { Config } from "../../../../settings/config";

export class RoundEndPhase implements IPhaseHandler {

    readonly phaseTag;
    readonly hud;

    constructor() {
        this.phaseTag = BombPlantPhaseEnum.RoundEnd;
        this.hud = new ActionHud();
        GamePhaseManager.currentTick = Config.bombplant.roundEnd.COUNTDOWN_TIME;
    }

    on_entry() {
        processWinner();
    }

    on_running() {
        const currentTick = GamePhaseManager.currentTick;
        if (currentTick % 20 == 0) {
            Broadcast.sound("firework.launch", {}, MemberManager.getPlayers());
        }
        return true;
    }

    on_exit() {
    }

    transitions() {
        const currentTick = GamePhaseManager.currentTick;
        const attackerScore = variable(`attacker_score`);
        const defenderScore = variable(`defender_score`);

        let winner = null;
        if (attackerScore >= Config.game.WINNING_SCORE) winner = TeamEnum.Attacker;
        if (defenderScore >= Config.game.WINNING_SCORE) winner = TeamEnum.Defender;

        if (winner) {
            set_variable(`winner`, winner);
            GamePhaseManager.updatePhase(new GameOverPhase());
            return;
        }

        if (currentTick <= 0) {
            
            if (attackerScore + defenderScore == Config.game.WINNING_SCORE - 1) {
                switchSide();
            }
            
            GamePhaseManager.updatePhase(new PreRoundStartPhase());
        }
    }

}

function switchSide() {
    for (const player of MemberManager.getPlayers()) {
        const playerTeam = MemberManager.getPlayerTeam(player);
        MemberManager.setPlayerTeam(player, (playerTeam === TeamEnum.Attacker) ? TeamEnum.Defender : TeamEnum.Attacker)

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
        const playerTeam = MemberManager.getPlayerTeam(player);
        const earn = Config.game.ROUND_INCOME[(playerTeam === winnerTeam) ? 0 : 1];
        EconomyManager.modifyMoney(player, earn);
        player.sendMessage(`${FC.Gray}>> ${FC.DarkGray}Round Income: +${earn}`);
    }
}