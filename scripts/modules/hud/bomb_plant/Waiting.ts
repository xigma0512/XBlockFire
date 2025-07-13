import { gameroom } from "../../../base/gameroom/GameRoom";
import { MemberManager } from "../../../base/gameroom/member/MemberManager";
import { PhaseManager } from "../../../base/gamephase/PhaseManager";
import { MapRegister } from "../../../base/gamemap/MapRegister";

import { Config } from "../../../base/gamephase/bomb_plant/_config";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { Broadcast } from "../../../utils/Broadcast";

const config = Config.idle;

export class WaitingHud implements InGameHud {
    
    constructor() { }

    update() {
        this.updateSubtitle();
        this.updateSidebar();
    }

    private updateSubtitle() {
        const players = MemberManager.getPlayers();
        const playerAmount = players.length;

        const phase = PhaseManager.getPhase();
        
        let text = `${FC.Yellow}Waiting for more players...`;
        
        if (config.AUTO_START && playerAmount >= config.AUTO_START_MIN_PLAYER) {
            text = `${FC.Green}Game will start in ${(phase.currentTick / 20).toFixed(0)} seconds.`;
        }
        
        if (phase.currentTick !== config.COUNTDOWN_TIME && playerAmount < config.AUTO_START_MIN_PLAYER) {
            Broadcast.message(`${FC.Bold}${FC.Red}Not enough players. Waiting for more players.`, players);
        }
        
        Broadcast.subtitle(text, players);
    }

    private updateSidebar() {
        const players = MemberManager.getPlayers();
        
        const date = new Date();
        const todayStr = `${date.getFullYear()}/${String(date.getMonth()).padStart(2, '0')}/${String(date.getDay()).padStart(2, '0')}`;
        
        const map = MapRegister.getMap(gameroom().gameMapId);
        const playerCount = players.length;

        const message = [
            `${FC.Bold}${FC.Yellow}  XBlockFire  `,
            `${FC.Gray}${todayStr} ${FC.DarkGray}`,
            '',
            `Map: ${FC.Green}${map.name}`,
            `Players: ${FC.Green}${playerCount}`,
            '',
            `Mode:`,
            `${FC.Green}${gameroom().gameMode}`,
            ''
        ];

        Broadcast.sidebar(message, players);
    }
}