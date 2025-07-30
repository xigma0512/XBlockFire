import { HotbarService } from "../../../../application/services/HotbarService";

import { MemberManager } from "../../../player/MemberManager";
import { EconomyManager } from "../../../economy/EconomyManager";
import { GamePhaseManager } from "../GamePhaseManager";
import { BuyingPhase } from "./Buying";

import { WaitingHud } from "../../../../interface/hud/ingame/bomb_plant/Waiting";

import { reset_variables, set_variable } from "../../../../infrastructure/data/Variable";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";
import { FormatCode as FC } from "../../../../declarations/enum/FormatCode";

import { Config } from "../../../../settings/config";

export class IdlePhase implements IPhaseHandler {

    readonly phaseTag;
    readonly hud;

    constructor() { 
        this.phaseTag = BombPlantPhaseEnum.Idle;
        this.hud = new WaitingHud();
        GamePhaseManager.currentTick = Config.bombplant.idle.COUNTDOWN_TIME;
    }

    on_entry() {
    }

    on_running() {
        let currentTick = GamePhaseManager.currentTick;
        const playerAmount = MemberManager.getPlayers().length;

        const isAutoStartEnable = Config.game.AUTO_START;
        const autoStartPlayerNeed = Config.game.AUTO_START_MIN_PLAYER;
        
        if (!isAutoStartEnable || playerAmount < autoStartPlayerNeed) {
            return false;
        }

        const originalTime = Config.bombplant.idle.COUNTDOWN_TIME;
        if (currentTick !== originalTime && playerAmount < autoStartPlayerNeed) {
            currentTick = originalTime;
            return false;
        }
        
        return true;
    }

    on_exit() {
        const isRandomAssignedEnable = Config.game.RANDOM_ASSIGNED;
        if (isRandomAssignedEnable) {
            randomTeam();
        }

        initializePlayers();
        initializeVariable();
    }

    transitions() {
        if (GamePhaseManager.currentTick <= 0) {
            GamePhaseManager.updatePhase(new BuyingPhase());
        }
    }

}

function randomTeam() {
    const players = MemberManager.getPlayers();
    
    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());

    let attackTeamCount = 0;
    let defenderTeamCount = 0;
    for (const player of shuffledPlayers) {
        if (attackTeamCount <= defenderTeamCount) {
            MemberManager.setPlayerTeam(player, TeamEnum.Attacker);
            attackTeamCount++;
            player.sendMessage(`${FC.Gray}>> ${FC.Yellow}You have been assigned to the Attacker Team.`);
        } else {
            MemberManager.setPlayerTeam(player, TeamEnum.Defender);
            defenderTeamCount++;
            player.sendMessage(`${FC.Gray}>> ${FC.Yellow}You have been assigned to the Defender Team.`);
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

function initializeVariable() {
    reset_variables();
    set_variable(`attacker_score`, 0);
    set_variable(`defender_score`, 0);
    for (const player of MemberManager.getPlayers()) {
        set_variable(`${player.name}.kills`, 0);
        set_variable(`${player.name}.deaths`, 0);
    }
}