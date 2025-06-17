import { GameRoomManager } from "../../GameRoom";
import { BP_BuyingPhase } from "./Buying";
import { BP_PhaseEnum, BP_PhaseEnumTable } from "./PhaseEnum";

import { TeamTagEnum } from "../../../../weapon/types/Enums";
import { Broadcast } from "../../../../../utils/Broadcast";
import { FormatCode as FC } from "../../../../../utils/FormatCode";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../../../../utils/Property";
import { GameModeEnumTable } from "../../GameModeEnum";

const AUTO_START = true;
const AUTO_START_MIN_PLAYER = 2;
const COUNTDOWN_TIME = 30 * 20;

export class BP_IdlePhase implements IPhaseHandler {

    readonly phaseTag = BP_PhaseEnum.Idle;
    private _currentTick: number = COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) { }

    on_entry() {
        this._currentTick = COUNTDOWN_TIME;
        console.warn(`[Room ${this.roomId}] Entry BP:idle phase.`);
    }

    on_running() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const members = room.memberManager.getPlayers();
        const playerAmount = members.length;

        let actionbarText = `${FC.Yellow}Waiting for more players...`;

        if (AUTO_START && playerAmount >= AUTO_START_MIN_PLAYER) {
            actionbarText = `${FC.Green}Game will start in ${(this.currentTick / 20).toFixed(0)} seconds.`;
            this._currentTick --;
        }

        if (this.currentTick !== COUNTDOWN_TIME && playerAmount < AUTO_START_MIN_PLAYER) {
            this._currentTick = COUNTDOWN_TIME;
            Broadcast.message(`${FC.Red}Not enough players. Waiting for more players.`, members);
        }

        Broadcast.actionbar(actionbarText, members);
        updateSidebar(this.roomId);
        this.transitions();
    }

    on_exit() {
        if (AUTO_START) balanceTeam(this.roomId);
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
            set_entity_dynamic_property(player, 'player:team', TeamTagEnum.Attacker);
            attackTeamCount++;
            player.sendMessage('You have been assigned to the Attacker Team.');
        } else {
            set_entity_dynamic_property(player, 'player:team', TeamTagEnum.Defender);
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

function updateSidebar(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();

    const currentState = BP_PhaseEnumTable[BP_PhaseEnum.Idle];
    const playerCount = players.length;
    const maxPlayers = 10;
    
    const sidebarMessage = [
        `${FC.Bold}${FC.White}Info:`,
        `  ${FC.Gold}Room Number: ${FC.White}${roomId}`,
        `  ${FC.MaterialCopper}Gamemode: ${FC.White}${GameModeEnumTable[room.gameMode]}`,
        `  ${FC.Aqua}Players: ${FC.White}${playerCount}/${maxPlayers}`,
        `  ${FC.Yellow}State: ${FC.Green}${currentState}`,
        '',
        
        `${FC.Bold}${FC.White}Players:`,
        ...players.map(player => {
            const playerTeam = entity_dynamic_property(player, 'player:team');
            const teamPrefix = 
                (playerTeam === TeamTagEnum.Attacker) ? `${FC.Red}[A]` :
                (playerTeam === TeamTagEnum.Defender) ? `${FC.Aqua}[D]` : `${FC.DarkPurple}[S]`;
            return ` ${FC.Gray}- ${teamPrefix}${player.name}`
        })
    ];

    Broadcast.topbar(['test top bar'], players)
    Broadcast.sidebar(sidebarMessage, players);
}