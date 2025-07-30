import { gameroom } from "../../../../domain/gameroom/GameRoom";
import { MemberManager } from "../../../../domain/player/MemberManager";
import { GamePhaseManager } from "../../../../domain/fsm/gamephase/GamePhaseManager";
import { MapRegister } from "../../../../domain/gameroom/MapRegister";

import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

import { FormatCode as FC } from "../../../../declarations/enum/FormatCode";
import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { lang } from "../../../../infrastructure/Language";

import { BombPlant as Config } from "../../../../settings/config";

export class WaitingHud implements InGameHud {
    
    constructor() { }

    update() {
        this.updateSubtitle();
        this.updateSidebar();
    }

    private updateSubtitle() {
        const currentTick = GamePhaseManager.currentTick;
        const playerAmount = MemberManager.getPlayers().length;
    
        let text = lang('hud.bombplant.waiting.waiting_for_players.subtitle');

        const isAutoStartEnable = Config.game.auto_start;
        const autoStartPlayerNeed = Config.game.auto_start_need_players;
        if (isAutoStartEnable && playerAmount >= autoStartPlayerNeed) {
            text = lang('hud.bombplant.waiting.count_down.subtitle', (currentTick / 20).toFixed(0));
        }
        
        const originalTime = Config.phaseTime.idle;
        if (currentTick !== originalTime && playerAmount < autoStartPlayerNeed) {
            Broadcast.message(lang('hud.bombplant.waiting.not_enough_player'));
        }
        
        Broadcast.subtitle(text);
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