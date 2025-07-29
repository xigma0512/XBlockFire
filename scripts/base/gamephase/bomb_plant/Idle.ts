import { MemberManager } from "../../member/MemberManager";
import { EconomyManager } from "../../economy/EconomyManager";
import { PhaseManager } from "../PhaseManager";
import { HotbarManager, HotbarTemplate } from "../../../modules/Hotbar";
import { WaitingHud } from "../../../interface/hud/ingame/bomb_plant/Waiting";

import { BuyingPhase } from "./Buying";

import { PhaseEnum as BombPlantPhaseEnum } from "../../../shared/types/gamephase/BombPlantPhaseEnum";
import { TeamEnum } from "../../../shared/types/TeamEnum";

import { FormatCode as FC } from "../../../shared/utils/FormatCode";
import { reset_variables, set_variable } from "../../../shared/utils/Variable";
import { ItemStackFactory } from "../../../shared/utils/ItemStackFactory";

import { ItemLockMode } from "@minecraft/server";

import { Config } from "../../../settings/config";

const game_config = Config.game;
const idle_config = Config.bombplant.idle;

export class IdlePhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.Idle;
    readonly hud: WaitingHud;
    
    private _currentTick: number = idle_config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor() { 
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

        this.hud.update();
        this.transitions();
    }

    on_exit() {
        if (game_config.RANDOM_ASSIGNED) randomTeam();
        initializePlayers();
        initializeVariable();
    }

    private transitions() {
        if (this.currentTick <= 0) return PhaseManager.updatePhase(new BuyingPhase());
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
        HotbarManager.sendHotbar(player, HotbarTemplate.initSpawn());
    }

    for (const player of MemberManager.getPlayers({team: TeamEnum.Defender})) {
        const hotbar = HotbarManager.getPlayerHotbar(player)
        hotbar.items[3] = ItemStackFactory.new({ typeId: 'xblockfire:defuser', lockMode: ItemLockMode.slot });
        HotbarManager.sendHotbar(player, hotbar);
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