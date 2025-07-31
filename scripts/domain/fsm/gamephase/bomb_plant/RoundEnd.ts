import { MemberManager } from "../../../player/MemberManager";
import { EconomyManager } from "../../../economy/EconomyManager";
import { GamePhaseManager } from "../GamePhaseManager";
import { GameOverPhase } from "./Gameover";
import { PreRoundStartPhase } from "./PreRoundStart";

import { ActionHud } from "../../../../interface/hud/ingame/bomb_plant/Action"; 

import { set_entity_dynamic_property } from "../../../../infrastructure/data/Property";
import { set_variable, variable } from "../../../../infrastructure/data/Variable";
import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { lang } from "../../../../infrastructure/Language";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

import { BombPlant as Config } from "../../../../settings/config";

export class RoundEndPhase implements IPhaseHandler {

    readonly phaseTag;
    readonly hud;

    constructor() {
        this.phaseTag = BombPlantPhaseEnum.RoundEnd;
        this.hud = new ActionHud();
        GamePhaseManager.currentTick = Config.phaseTime.roundend;
    }

    on_entry() {
        scoreUpdate();
        sendRoundIncome();
    }

    on_running() {
        const currentTick = GamePhaseManager.currentTick;
        if (currentTick % 20 == 0) {
            Broadcast.sound("firework.launch", {});
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
        if (attackerScore >= Config.game.winning_score) winner = TeamEnum.Attacker;
        if (defenderScore >= Config.game.winning_score) winner = TeamEnum.Defender;

        if (winner) {
            set_variable(`winner`, winner);
            GamePhaseManager.updatePhase(new GameOverPhase());
            return;
        }

        if (currentTick <= 0) {
            
            if (attackerScore + defenderScore == Config.game.winning_score - 1) {
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

    Broadcast.message(lang('game.bombplant.roundend.switch_side'));
}

function scoreUpdate() {
    const winnerTeam = variable(`round_winner`) as TeamEnum;
    if (winnerTeam === TeamEnum.Attacker) {
        set_variable(`attacker_score`, variable(`attacker_score`) + 1);
    } else if (winnerTeam === TeamEnum.Defender) { 
        set_variable(`defender_score`, variable(`defender_score`) + 1);
    }
}

function sendRoundIncome() {
    const winnerTeam = variable(`round_winner`) as TeamEnum;
    for (const player of MemberManager.getPlayers()) {
        const playerTeam = MemberManager.getPlayerTeam(player);
        const earn = Config.economic.round_income[(playerTeam === winnerTeam) ? 0 : 1];
        EconomyManager.modifyMoney(player, earn);
        player.sendMessage(lang('game.bombplant.roundend.round_income', earn));
    }
}