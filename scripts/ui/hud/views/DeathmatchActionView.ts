import { gameroom } from '../../../modules/core/GameRoom';
import { PhaseManager } from '../../../modules/core/gamephase/PhaseManager';
import { DeathmatchState } from '../../../modules/core/gamemodes/Deathmatch/DeathmatchState';
import { MapRegister } from '../../../modules/world/MapRegister';

import { MemberManager } from '../../../modules/player/MemberManager';

import { InGameHud } from '../../InGameHud';
import { HudDriver } from '../drivers/HudDriver';
import { UiStateManager } from '../state/UiState';

import { MatchScore } from '../components/MatchScore';
import { RoomInfo } from '../components/RoomInfo';
import { PlayerList } from '../components/PlayerList';
import { DebugInfo } from '../components/DebugInfo';

import { FormatCode as FC } from '../../../utils/FormatCode';

export class DeathmatchActionView implements InGameHud {
    update() {
        this.updateTitle();
        this.updateSidebar();
    }

    private updateTitle() {
        const phase = PhaseManager.getPhase();
        const totalTicks = phase.currentTick;
        const seconds = Math.max(0, Math.floor(totalTicks / 20));
        const timeStr =
            seconds < 15
                ? FC.Red + (seconds + (totalTicks % 20) * 0.05).toFixed(2)
                : FC.White + `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

        const { attacker: aScore, defender: dScore } = DeathmatchState.getScores();
        let title = MatchScore.format(aScore, timeStr, dScore);

        for (const player of MemberManager.getPlayers()) {
            let finalTitle = title;

            const notify = UiStateManager.getNotifyMessage(player);
            if (notify) finalTitle += `\n${notify}`;

            const extra = UiStateManager.getRoundEndMessage(player);
            if (extra) finalTitle += `\n${extra}`;

            HudDriver.pushTitle(player, finalTitle, 2, 'game_status');
        }
    }

    private updateSidebar() {
        const room = gameroom();
        const map = MapRegister.getMap(room.gameMapId);
        HudDriver.setSidebar([
            ...RoomInfo.format(map.name, room.gameMode),
            ...PlayerList.format(true),
            ...DebugInfo.format(),
        ]);
    }
}
