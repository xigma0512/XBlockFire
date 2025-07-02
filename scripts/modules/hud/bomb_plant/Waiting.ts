import { GameRoomManager } from "../../../base/gameroom/GameRoom";
import { HudTextController } from "../HudTextController";

import { Config } from "../../../base/gamephase/bomb_plant/_config";
import { GameModeEnumTable } from "../../../types/gameroom/GameModeEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { Broadcast } from "../../../utils/Broadcast";

const config = Config.idle;

export class WaitingHud implements InGameHud {
    
    constructor(private readonly roomId: number) { }

    update() {
        this.updateSubtitle();
        this.updateSidebar();
    }

    private updateSubtitle() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const phase = room.phaseManager.getPhase();
        const members = room.memberManager.getPlayers();
        const playerAmount = members.length;
        
        let text = `${FC.Yellow}Waiting for more players...`;
        
        if (config.AUTO_START && playerAmount >= config.AUTO_START_MIN_PLAYER) {
            text = `${FC.Green}Game will start in ${(phase.currentTick / 20).toFixed(0)} seconds.`;
        }
        
        if (phase.currentTick !== config.COUNTDOWN_TIME && playerAmount < config.AUTO_START_MIN_PLAYER) {
            Broadcast.message(`${FC.Red}Not enough players. Waiting for more players.`, members);
        }
        
        for (const player of members) {
            HudTextController.add(player, 'subtitle', text);
        }
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
        
        for (const player of players) {
            HudTextController.add(player, 'sidebar', sidebarMessage);
        }
    }
}