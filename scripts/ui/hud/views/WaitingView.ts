import { gameroom } from '../../../modules/core/GameRoom';
import { MemberManager } from '../../../modules/player/MemberManager';
import { PhaseManager } from '../../../modules/core/gamephase/PhaseManager';
import { MapRegister } from '../../../modules/world/MapRegister';

import { Language as L } from '../../../utils/Language';
import { HudDriver } from '../drivers/HudDriver';
import { RoomInfo } from '../components/RoomInfo';
import { PlayerList } from '../components/PlayerList';
import { DebugInfo } from '../components/DebugInfo';
import { FormatCode as FC } from '../../../utils/FormatCode';

import { Config } from '../../../settings/config';

const COUNTDOWN_TIME = 20 * 20;

import { InGameHud } from '../../InGameHud';

export class WaitingView implements InGameHud {
    update() {
        this.updateSubtitle();
        this.updateSidebar();
    }

    private updateSubtitle() {
        const players = MemberManager.getPlayers();
        const playerAmount = players.length;
        const phase = PhaseManager.getPhase();

        let text = FC.Yellow + L.translate('hud.waiting');

        if (playerAmount >= Config.game.AUTO_START_MIN_PLAYER) {
            text = FC.Green + L.translate('hud.start_in', (phase.currentTick / 20).toFixed(0));
        }

        if (phase.currentTick !== COUNTDOWN_TIME && playerAmount < Config.game.AUTO_START_MIN_PLAYER) {
            HudDriver.chat(FC.Red + L.translate('game.wait_players'), players);
        }

        HudDriver.pushSubtitle(players, FC.Bold + text, 2);
    }

    private updateSidebar() {
        const room = gameroom();
        const map = MapRegister.getMap(room.gameMapId);

        const lines = [
            ...RoomInfo.format(map.name, room.gameMode),
            ...PlayerList.format(false), // showKD: false
            ...DebugInfo.format(),
        ];

        HudDriver.setSidebar(lines);
    }
}
