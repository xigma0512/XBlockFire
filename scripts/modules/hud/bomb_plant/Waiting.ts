import { GameRoomManager } from "../../gameroom/systems/GameRoom";

import { BP_Config } from "../../gameroom/systems/phase/bomb_plant/_config";
import { GameModeEnumTable } from "../../gameroom/systems/GameModeEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { Broadcast } from "../../../utils/Broadcast";

const config = BP_Config.idle;

export class BP_WaitingHud implements InGameHud {
    
    constructor(private readonly roomId: number) { }

    update() {
        this.updateActionbar();
        this.updateSidebar();
    }

    private updateActionbar() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const members = room.memberManager.getPlayers();
        const phase = room.phaseManager.getPhase();
        const playerAmount = members.length;
    
        let actionbarText = `${FC.Yellow}Waiting for more players...`;
    
        if (config.AUTO_START && playerAmount >= config.AUTO_START_MIN_PLAYER) {
            actionbarText = `${FC.Green}Game will start in ${(phase.currentTick / 20).toFixed(0)} seconds.`;
        }
    
        if (phase.currentTick !== config.COUNTDOWN_TIME && playerAmount < config.AUTO_START_MIN_PLAYER) {
            Broadcast.message(`${FC.Red}Not enough players. Waiting for more players.`, members);
        }
    
        Broadcast.actionbar(actionbarText, members);
    }

    private updateSidebar() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const players = room.memberManager.getPlayers();
        
        const playerCount = players.length;
        const maxPlayers = 10;

        const sidebarMessage = [
            `${FC.Bold}${FC.White}Info:`,
            `  ${FC.Gold}Room Number: ${FC.White}${this.roomId}`,
            `  ${FC.MaterialCopper}Gamemode: ${FC.White}${GameModeEnumTable[room.gameMode]}`,
            `  ${FC.Aqua}Players: ${FC.White}${playerCount}/${maxPlayers}`,
            ...players.map(player => `  ${FC.Gray}- ${player.name}`)
        ];
        
        Broadcast.sidebar(sidebarMessage, players);
    }
}