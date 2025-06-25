import { GameRoomManager } from "../../GameRoom";
import { BP_BuyingPhase } from "./Buying";
import { BP_PhaseEnum } from "../../../types/PhaseEnum";

import { BP_Config } from "./Config";
import { TeamEnum } from "../../../types/TeamEnum";
import { Broadcast } from "../../../../../utils/Broadcast";
import { FormatCode as FC } from "../../../../../utils/FormatCode";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../../../../utils/Property";
import { GameModeEnumTable } from "../../GameModeEnum";

const config = BP_Config.idle;

export class BP_IdlePhase implements IPhaseHandler {

    readonly phaseTag = BP_PhaseEnum.Idle;
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) { }

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

        updateActionbar(this.roomId, this.currentTick);
        updateSidebar(this.roomId);
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

function updateActionbar(roomId: number, currentTick: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const members = room.memberManager.getPlayers();
    const playerAmount = members.length;

    let actionbarText = `${FC.Yellow}Waiting for more players...`;

    if (config.AUTO_START && playerAmount >= config.AUTO_START_MIN_PLAYER) {
        actionbarText = `${FC.Green}Game will start in ${(currentTick / 20).toFixed(0)} seconds.`;
    }

    if (currentTick !== config.COUNTDOWN_TIME && playerAmount < config.AUTO_START_MIN_PLAYER) {
        Broadcast.message(`${FC.Red}Not enough players. Waiting for more players.`, members);
    }

    Broadcast.actionbar(actionbarText, members);
}

function updateSidebar(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();

    const playerCount = players.length;
    const maxPlayers = 10;
    
    const sidebarMessage = [
        `${FC.Bold}${FC.White}Info:`,
        `  ${FC.Gold}Room Number: ${FC.White}${roomId}`,
        `  ${FC.MaterialCopper}Gamemode: ${FC.White}${GameModeEnumTable[room.gameMode]}`,
        `  ${FC.Aqua}Players: ${FC.White}${playerCount}/${maxPlayers}`,
        `  ${FC.Yellow}State: ${FC.Green}Waiting`,
        '',
        
        `${FC.Bold}${FC.White}Players:`,
        ...players.map(player => {
            const playerTeam = entity_dynamic_property(player, 'player:team');
            const teamPrefix = 
                (playerTeam === TeamEnum.Attacker) ? `${FC.Red}[A]` :
                (playerTeam === TeamEnum.Defender) ? `${FC.Aqua}[D]` : `${FC.DarkPurple}[S]`;
            return ` ${FC.Gray}- ${teamPrefix}${player.name}`
        })
    ];

    Broadcast.sidebar(sidebarMessage, players);
}