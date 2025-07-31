import { HotbarService } from "../../../../application/services/HotbarService";

import { MemberManager } from "../../../player/MemberManager";
import { EconomyManager } from "../../../economy/EconomyManager";
import { GamePhaseManager } from "../GamePhaseManager";
import { BuyingPhase } from "./Buying";

import { WaitingHud } from "../../../../interface/hud/ingame/bomb_plant/Waiting";

import { reset_variables, set_variable } from "../../../../infrastructure/data/Variable";
import { lang } from "../../../../infrastructure/Language";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

import { BombPlant as Config } from "../../../../settings/config";

export class IdlePhase implements IPhaseHandler {

    readonly phaseTag;
    readonly hud;

    constructor() { 
        this.phaseTag = BombPlantPhaseEnum.Idle;
        this.hud = new WaitingHud();
        GamePhaseManager.currentTick = Config.phaseTime.idle;
    }

    on_entry() {
    }

    on_running() {
        let currentTick = GamePhaseManager.currentTick;
        const playerAmount = MemberManager.getPlayers().length;

        const isAutoStartEnable = Config.game.auto_start;
        const autoStartPlayerNeed = Config.game.auto_start_need_players;
        
        if (!isAutoStartEnable || playerAmount < autoStartPlayerNeed) {
            return false;
        }

        const originalTime = Config.phaseTime.idle;
        if (currentTick !== originalTime && playerAmount < autoStartPlayerNeed) {
            currentTick = originalTime;
            return false;
        }
        
        return true;
    }

    on_exit() {
        randomTeamAssigned();
        initializePlayers();
        initializeVariables();
    }

    transitions() {
        if (GamePhaseManager.currentTick <= 0) {
            GamePhaseManager.updatePhase(new BuyingPhase());
        }
    }

}

function randomTeamAssigned() {
    const isRandomAssignedEnable = Config.game.random_assigned;
    if (!isRandomAssignedEnable) return;

    const players = MemberManager.getPlayers();
    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());

    let attackTeamCount = 0;
    let defenderTeamCount = 0;
    for (const player of shuffledPlayers) {
        if (attackTeamCount <= defenderTeamCount) {
            MemberManager.setPlayerTeam(player, TeamEnum.Attacker);
            attackTeamCount++;
            player.sendMessage(lang('game.bombplant.idle.random_assigned_attacker'));
        } else {
            MemberManager.setPlayerTeam(player, TeamEnum.Defender);
            defenderTeamCount++;
            player.sendMessage(lang('game.bombplant.idle.random_assigned_defender'));
        }
    }
}

function initializePlayers() {
    for (const player of MemberManager.getPlayers()) {
        EconomyManager.initializePlayer(player);

        HotbarService.clearHotbar(player);
        HotbarService.sendDefaultKit(player);
    }
}

function initializeVariables() {
    reset_variables();
    set_variable(`attacker_score`, 0);
    set_variable(`defender_score`, 0);
    for (const player of MemberManager.getPlayers()) {
        set_variable(`${player.name}.kills`, 0);
        set_variable(`${player.name}.deaths`, 0);
    }
}