import { PhaseManager } from '../../../modules/core/gamephase/PhaseManager';
import { MemberManager } from '../../../modules/player/MemberManager';
import { TeamEnum } from '../../../modules/player/TeamEnum';
import { gameroom } from '../../../modules/core/GameRoom';
import { MapRegister } from '../../../modules/world/MapRegister';

import { HudDriver } from '../drivers/HudDriver';
import { UiStateManager } from '../state/UiState';
import { SurvivalIcons } from '../components/SurvivalIcons';
import { MatchScore } from '../components/MatchScore';
import { RoomInfo } from '../components/RoomInfo';
import { PlayerList } from '../components/PlayerList';
import { DebugInfo } from '../components/DebugInfo';

import { variable } from '../../../utils/Variable';

import { InGameHud } from '../../InGameHud';
import { PhaseEnum } from '../../../modules/core/gamemodes/BombPlant/phases/BombPlantPhaseEnum';
import { Language } from '../../../utils/Language';
import { FormatCode as FC } from '../../../utils/FormatCode';

export class ActionView implements InGameHud {
    update() {
        this.updateTitle();
        this.updateSubtitle();
        this.updateSidebar();
    }

    private updateTitle() {
        const phase = PhaseManager.getPhase();
        const totalTicks = phase.currentTick;
        const seconds = Math.max(0, Math.floor(totalTicks / 20));

        let timeStr;

        const phaseId = PhaseManager.getPhase().phaseId;
        if (seconds < 15 && phaseId === PhaseEnum.Action) {
            const subSeconds = (totalTicks % 20) * 0.05;
            const displaySeconds = seconds + subSeconds;

            timeStr = FC.Red + displaySeconds.toFixed(2);
        } else {
            timeStr = FC.White + `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
        }

        // Get data for both teams
        const attackerTotal = MemberManager.getPlayers({ team: TeamEnum.Attacker }).length;
        const attackerAlive = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: true }).length;
        const defenderTotal = MemberManager.getPlayers({ team: TeamEnum.Defender }).length;
        const defenderAlive = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true }).length;

        const maxPlayers = Math.max(attackerTotal, defenderTotal, 1);

        for (const player of MemberManager.getPlayers()) {
            const team = MemberManager.getPlayerTeam(player);

            let leftIcons, rightIcons, leftScore, rightScore;
            const aScore = variable(`attacker_score`) || 0;
            const dScore = variable(`defender_score`) || 0;

            if (team === TeamEnum.Attacker) {
                leftScore = aScore;
                rightScore = dScore;

                leftIcons = '[T] ' + SurvivalIcons.format(attackerTotal, attackerAlive, true, maxPlayers);
                rightIcons = SurvivalIcons.format(defenderTotal, defenderAlive, false, maxPlayers) + '[CT] ';
            } else {
                leftScore = dScore;
                rightScore = aScore;

                leftIcons = '[T] ' + SurvivalIcons.format(defenderTotal, defenderAlive, true, maxPlayers);
                rightIcons = SurvivalIcons.format(attackerTotal, attackerAlive, false, maxPlayers) + '[CT] ';
            }

            const matchLine = MatchScore.format(leftScore, timeStr, rightScore);
            let finalTitle = `${FC.MaterialEmerald}${leftIcons}${matchLine}${FC.MaterialRedstone}${rightIcons}`;

            const notify = UiStateManager.getNotifyMessage(player);
            if (notify) finalTitle += `\n${notify}`;

            const extra = UiStateManager.getRoundEndMessage(player);
            if (extra) finalTitle += `\n${extra}`;

            HudDriver.pushTitle(player, finalTitle, 2, 'game_status');
        }
    }

    private updateSubtitle() {
        const phase = PhaseManager.getPhase();

        let text: string | string[] = '';
        switch (phase.phaseId) {
            case PhaseEnum.Buying:
                text = `${FC.Bold}${FC.Yellow}${Language.translate('hud.buying.subtitle')}`;
                break;
        }

        if (text === '') return;
        const members = MemberManager.getPlayers();
        for (const player of members) {
            HudDriver.pushSubtitle(player, text, 2);
        }
    }

    private updateSidebar() {
        const room = gameroom();
        const map = MapRegister.getMap(room.gameMapId);

        const lines = [
            ...RoomInfo.format(map.name, room.gameMode),
            ...PlayerList.format(true), // showKD: true
            ...DebugInfo.format(),
        ];

        HudDriver.setSidebar(lines);
    }
}
