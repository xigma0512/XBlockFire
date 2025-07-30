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

const game_config = Config.game;
const idle_config = Config.bombplant.idle;

export class IdlePhase implements IPhaseHandler {

    readonly phaseTag;
    readonly hud;

    constructor() { 
        this.phaseTag = BombPlantPhaseEnum.Idle;
        this.hud = new WaitingHud();
    }

    on_entry() {
        this._currentTick = idle_config.COUNTDOWN_TIME;
    }

    on_running() {
        const members = MemberManager.getPlayers();
        const playerAmount = members.length;

        if (game_config.AUTO_START && playerAmount >= game_config.AUTO_START_MIN_PLAYER) this._currentTick --;
        if (this.currentTick !== idle_config.COUNTDOWN_TIME && playerAmount < game_config.AUTO_START_MIN_PLAYER) this._currentTick = idle_config.COUNTDOWN_TIME;
    }

    on_exit() {
        if (game_config.RANDOM_ASSIGNED) randomTeam();
        initializePlayers();
        initializeVariable();
    }

    transitions() {
        if (this.currentTick <= 0) return GamePhaseManager.updatePhase(new BuyingPhase());
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

    for (const player of MemberManager.getPlayers({team: TeamEnum.Defender})) {
        HotbarService.sendDefuserKit(player);
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