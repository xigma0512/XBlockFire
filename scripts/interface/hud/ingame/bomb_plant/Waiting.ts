import { gameroom } from "../../../../domain/gameroom/GameRoom";
import { MemberManager } from "../../../../domain/player/MemberManager";
import { GamePhaseManager } from "../../../../domain/fsm/gamephase/GamePhaseManager";
import { MapRegister } from "../../../../domain/gameroom/MapRegister";

import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

import { FormatCode as FC } from "../../../../declarations/enum/FormatCode";
import { Broadcast } from "../../../../infrastructure/utils/Broadcast";

import { Config } from "../../../../settings/config";
import { lang } from "../../../../infrastructure/Language";

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

        const phase = GamePhaseManager.getPhase();
        
        let text = lang('hud.bombplant.waiting.waiting_for_players.subtitle');
        
        if (game_config.AUTO_START && playerAmount >= game_config.AUTO_START_MIN_PLAYER) {
            text = lang('hud.bombplant.waiting.count_down.subtitle', (phase.currentTick / 20).toFixed(0));
        }
        
        if (phase.currentTick !== idle_config.COUNTDOWN_TIME && playerAmount < game_config.AUTO_START_MIN_PLAYER) {
            Broadcast.message(lang('hud.bombplant.waiting.not_enough_player'));
        }
        
        Broadcast.subtitle(text, players);
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
            `Map: ${FC.Green}${map.name}`,
            `Players: ${FC.Green}${playerCount} ${FC.White}(${FC.Aqua}${defenders.length}${FC.White}/${FC.Red}${attackers.length}${FC.White})`,
            ...defenders.map(p => `${FC.Gray}- ${FC.Aqua}${p.name}`),
            ...attackers.map(p => `${FC.Gray}- ${FC.Red}${p.name}`),
            ...spectators.map(p => `${FC.Gray}- ${p.name}`),
            '',
            `Mode:`,
            `${FC.Green}${gameroom().gameMode}`,
            ''
        ];

        Broadcast.sidebar(message);
    }
}