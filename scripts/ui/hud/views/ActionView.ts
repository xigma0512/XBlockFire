import { PhaseManager } from "../../../modules/core/gamephase/PhaseManager";
import { MemberManager } from "../../../modules/player/MemberManager";
import { TeamEnum } from "../../../modules/player/TeamEnum";
import { gameroom } from "../../../modules/core/GameRoom";
import { MapRegister } from "../../../modules/world/MapRegister";
import { FormatCode as FC } from "../../../utils/FormatCode";

import { HudDriver } from "../drivers/HudDriver";
import { UiStateManager } from "../state/UiState";
import { SurvivalIcons } from "../components/SurvivalIcons";
import { MatchScore } from "../components/MatchScore";
import { RoomInfo } from "../components/RoomInfo";
import { PlayerList } from "../components/PlayerList";

import { variable } from "../../../utils/Variable";

import { InGameHud } from "../../InGameHud";
import { PhaseEnum } from "../../../modules/core/gamephase/BombPlantPhaseEnum";
import { Language } from "../../../utils/Language";

export class ActionView implements InGameHud {
    
    update() {
        this.updateTitle();
        this.updateSubtitle();
        this.updateSidebar();
    }

    private updateTitle() {
        const phase = PhaseManager.getPhase();
        const seconds = Math.max(0, Math.floor(phase.currentTick / 20));
        const timeStr = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

        // Get data for both teams
        const attackerTotal = MemberManager.getPlayers({ team: TeamEnum.Attacker }).length;
        const attackerAlive = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: true }).length;
        const defenderTotal = MemberManager.getPlayers({ team: TeamEnum.Defender }).length;
        const defenderAlive = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true }).length;
        
        const maxPlayers = Math.max(attackerTotal, defenderTotal, 1);

        for (const player of MemberManager.getPlayers()) {
            const team = MemberManager.getPlayerTeam(player);
            
            let leftIcons, rightIcons, leftScore, rightScore, leftColor, rightColor;
            const aScore = variable(`attacker_score`) || 0;
            const dScore = variable(`defender_score`) || 0;

            if (team === TeamEnum.Attacker) {
                leftColor = FC.Red;
                leftScore = aScore;
                leftIcons = '\uE015 ' + SurvivalIcons.format(attackerTotal, attackerAlive, FC.Red, true, maxPlayers);
                
                rightColor = FC.Green;
                rightScore = dScore;
                rightIcons = SurvivalIcons.format(defenderTotal, defenderAlive, FC.Green, false, maxPlayers) + ' \uE089';
            } else {
                leftColor = FC.Green;
                leftScore = dScore;
                leftIcons = '\uE089 ' + SurvivalIcons.format(defenderTotal, defenderAlive, FC.Green, true, maxPlayers);

                rightColor = FC.Red;
                rightScore = aScore;
                rightIcons = SurvivalIcons.format(attackerTotal, attackerAlive, FC.Red, false, maxPlayers) + ' \uE015';
            }

            const matchLine = MatchScore.format(leftScore, leftColor, timeStr, rightScore, rightColor);
            let finalTitle = `${leftIcons}${matchLine}${rightIcons}`;

            const extra = UiStateManager.getRoundEndMessage(player);
            if (extra) finalTitle += `\n${extra}`;

            HudDriver.pushTitle(player, finalTitle, 2, "game_status");
        }
    }

    private updateSubtitle() {
        const phase = PhaseManager.getPhase();

        let text: string | string[] = '';
        switch (phase.phaseTag) {
            case PhaseEnum.Buying:
                text = Language.translate("hud.buying.subtitle");
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
            ...PlayerList.format(true) // showKD: true
        ];

        HudDriver.setSidebar(lines);
    }
}
