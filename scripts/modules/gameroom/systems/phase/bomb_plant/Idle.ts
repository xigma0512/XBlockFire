import { GameRoomManager } from "../../GameRoom";
import { BP_BuyingPhase } from "./Buying";
import { BP_PhaseEnum } from "../../../types/PhaseEnum";

import { BP_Config } from "./Config";
import { TeamEnum } from "../../../types/TeamEnum";
import { set_entity_dynamic_property } from "../../../../../utils/Property";
import { BP_IdlePhaseHud } from "../../../../hud/bomb_plant/Idle";

const config = BP_Config.idle;

export class BP_IdlePhase implements IPhaseHandler {

    readonly phaseTag = BP_PhaseEnum.Idle;
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    private hud: BP_IdlePhaseHud;

    constructor(private readonly roomId: number) { 
        this.hud = new BP_IdlePhaseHud(roomId);
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        console.warn(`[Room ${this.roomId}] Entry BP:idle phase.`);
    }

    on_running() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const members = room.memberManager.getPlayers();
        const playerAmount = members.length;

        if (config.AUTO_START && playerAmount >= config.AUTO_START_MIN_PLAYER) this._currentTick --;
        if (this.currentTick !== config.COUNTDOWN_TIME && playerAmount < config.AUTO_START_MIN_PLAYER) this._currentTick = config.COUNTDOWN_TIME;

        this.hud.update();
        this.transitions();
    }

    on_exit() {
        if (config.AUTO_START) balanceTeam(this.roomId);
        initializePlayers(this.roomId);
        console.warn(`[Room ${this.roomId}] Exit BP:idle phase.`);
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);

        if (this.currentTick <= 0) return room.phaseManager.updatePhase(new BP_BuyingPhase(this.roomId));
    }

}

function balanceTeam(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();
    
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

function initializePlayers(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();

    for (const player of players) {
        room.economyManager.initializePlayer(player);
    }
}