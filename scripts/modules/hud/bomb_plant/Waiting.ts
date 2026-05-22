import { gameroom } from "../../../base/gameroom/GameRoom";
import { MemberManager } from "../../../base/member/MemberManager";
import { PhaseManager } from "../../../base/gamephase/PhaseManager";
import { MapRegister } from "../../../base/gamemap/MapRegister";

import { TeamEnum } from "../../../base/member/TeamEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { MessageManager as Msg } from "../MessageManager";

import { Config } from "../../../settings/config";

const game_config = Config.game;
const idle_config = Config.bombplant.idle;

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
        
        let text = Msg.translate("hud.waiting");
        
        if (game_config.AUTO_START && playerAmount >= game_config.AUTO_START_MIN_PLAYER) {
            text = Msg.translate("hud.start_in", (phase.currentTick / 20).toFixed(0));
        }
        
        if (phase.currentTick !== idle_config.COUNTDOWN_TIME && playerAmount < game_config.AUTO_START_MIN_PLAYER) {
            Msg.message("game.wait_players", players);
        }
        
        Msg.rawSubtitle(text, players);
    }

    private updateSidebar() {
        const players = MemberManager.getPlayers();
        
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const date = new Date();
        const todayStr = `${String(date.getFullYear()).slice(-2)}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} (${daysOfWeek[date.getDay()]})`;
        
        const map = MapRegister.getMap(gameroom().gameMapId);
        const playerCount = players.length;

        const defenders = MemberManager.getPlayers({team: TeamEnum.Defender});
        const attackers = MemberManager.getPlayers({team: TeamEnum.Attacker});
        const spectators = MemberManager.getPlayers({team: TeamEnum.Spectator});

        const message = [
            `${FC.Bold}${FC.Yellow}    XBlockFire    `,
            ` ${FC.Gray}${todayStr}`,
            '',
            Msg.translate("hud.sidebar.map", map.name),
            Msg.translate("hud.sidebar.players", playerCount, defenders.length, attackers.length),
            ...defenders.map(p => `${FC.Gray}- ${FC.Aqua}${p.name}`),
            ...attackers.map(p => `${FC.Gray}- ${FC.Red}${p.name}`),
            ...spectators.map(p => `${FC.Gray}- ${p.name}`),
            '',
            Msg.translate("hud.sidebar.mode"),
            `${FC.Green}${gameroom().gameMode}`,
            ''
        ];

        Msg.sidebar(message, players);
    }
}
