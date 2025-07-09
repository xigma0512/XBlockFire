import { GameRoomManager } from "../../../base/gameroom/GameRoom";
import { HudTextController } from "../HudTextController";
import { MapRegister } from "../../../base/gamemap/MapRegister";

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
        
        const date = new Date();
        const todayStr = `${date.getFullYear()}/${String(date.getMonth()).padStart(2, '0')}/${String(date.getDay()).padStart(2, '0')}`;
        
        const map = MapRegister.instance.getMap(room.gameMapId);
        const playerCount = players.length;

        const message = [
            `${FC.Bold}${FC.Yellow}    XBlockFire    `,
            `${FC.Gray}${todayStr} ${FC.DarkGray}Room${this.roomId}`,
            '',
            `Map: ${FC.Green}${map.name}`,
            `Players: ${FC.Green}${playerCount}`,
            '',
            `Mode:`,
            `${FC.Green}${GameModeEnumTable[room.gameMode]}`,
            ''
        ];

        Broadcast.sidebar(message, players);
    }
}