import { MemberManager } from "../../gameroom/member/MemberManager";
import { EconomyManager } from "../../gameroom/economy/EconomyManager";
import { PhaseManager } from "../PhaseManager";
import { HotbarManager, HotbarTemplate } from "../../../modules/hotbar/Hotbar";
import { WaitingHud } from "../../../modules/hud/bomb_plant/Waiting";

import { BuyingPhase } from "./Buying";
import { Config } from "./_config";

import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";
import { TeamEnum } from "../../../types/TeamEnum";

import { set_entity_dynamic_property } from "../../../utils/Property";
import { set_variable } from "../../../utils/Variable";
import { ItemStackFactory } from "../../../utils/ItemStackFactory";

import { ItemLockMode } from "@minecraft/server";

const config = Config.idle;

export class IdlePhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.Idle;
    readonly hud: WaitingHud;
    
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor() { 
        this.hud = new WaitingHud();
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
    }

    on_running() {
        const members = MemberManager.getPlayers();
        const playerAmount = members.length;

        if (config.AUTO_START && playerAmount >= config.AUTO_START_MIN_PLAYER) this._currentTick --;
        if (this.currentTick !== config.COUNTDOWN_TIME && playerAmount < config.AUTO_START_MIN_PLAYER) this._currentTick = config.COUNTDOWN_TIME;

        this.hud.update();
        this.transitions();
    }

    on_exit() {
        if (config.AUTO_START) balanceTeam();
        initializePlayers();
        initializeVariable();
    }

    private transitions() {
        if (this.currentTick <= 0) return PhaseManager.updatePhase(new BuyingPhase());
    }

}

function balanceTeam() {
    const players = MemberManager.getPlayers();
    
    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());

    let attackTeamCount = 0;
    let defenderTeamCount = 0;
    for (const player of shuffledPlayers) {
        if (attackTeamCount <= defenderTeamCount) {
            set_entity_dynamic_property(player, 'player:team', TeamEnum.Attacker);
            attackTeamCount++;
            player.sendMessage('You have been assigned to the Attacker Team.');
        } else {
            set_entity_dynamic_property(player, 'player:team', TeamEnum.Defender);
            defenderTeamCount++;
            player.sendMessage('You have been assigned to the Defender Team.');
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
    set_variable(`attacker_score`, 0);
    set_variable(`defender_score`, 0);
}