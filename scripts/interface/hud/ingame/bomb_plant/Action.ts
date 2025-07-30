import { GamePhaseManager } from "../../../../domain/fsm/gamephase/GamePhaseManager";
import { MemberManager } from "../../../../domain/player/MemberManager";
import { EconomyManager } from "../../../../domain/economy/EconomyManager";
import { HudTextController } from "../../HudTextController";

import { TeamEnum } from "../../../../declarations/enum/TeamEnum";
import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";

import { FormatCode as FC } from "../../../../declarations/enum/FormatCode";
import { variable } from "../../../../infrastructure/data/Variable";
import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { lang } from "../../../../infrastructure/Language";

export class ActionHud implements InGameHud {
    
    constructor() { }
    
    update() {
        this.updateSubtitle();
        this.updateSidebar();
    }

    private updateSubtitle() {
        
        const phase = GamePhaseManager.getPhase();

        let text: string | string[] = '';
        switch (phase.phaseTag) {
            case BombPlantPhaseEnum.Buying:
                text = [
                    lang('hud.bombplant.action.buying_message.subtitle.1', (phase.currentTick / 20).toFixed(0)),
                    lang('hud.bombplant.action.buying_message.subtitle.2')
                ];
                break;
        }

        if (text === '') return;
        Broadcast.subtitle(text);
    }

    private updateSidebar() {
        
        const players = MemberManager.getPlayers();
        const phase = GamePhaseManager.getPhase();

        const attackerScore = variable(`attacker_score`);
        const defenderScore = variable(`defender_score`);

        const attackerPlayers = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: true });
        const defenderPlayers = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });

        const attackerDeadPlayers = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: false });
        const defenderDeadPlayers = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: false });

        const seconds = Number((phase.currentTick / 20).toFixed(0));
        
        for (const player of players) {

            const playerTeam = MemberManager.getPlayerTeam(player);
            const playerTeamStr = (playerTeam === TeamEnum.Attacker) ? `${FC.Red}Attacker` : `${FC.Aqua}Defender`;

            const message = [
                `${FC.Bold}   ${FC.Gold}Round ${defenderScore + attackerScore + 1}${FC.Reset}  `,
                `Round Time: ${FC.Gray}${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
                '',
                `${FC.Aqua}D-${defenderScore} ${FC.White}| ${FC.Bold}${FC.Aqua}${'O '.repeat(defenderPlayers.length)}${FC.Gray}${'X '.repeat(defenderDeadPlayers.length)}`,
                `${FC.Red}A-${attackerScore} ${FC.White}| ${FC.Bold}${FC.Red}${'O '.repeat(attackerPlayers.length)}${FC.Gray}${'X '.repeat(attackerDeadPlayers.length)}`,
                '',
                `K/D: ${FC.Green}${variable(`${player.name}.kills`)}/${variable(`${player.name}.deaths`)}`,
                `Money: ${FC.Green}${EconomyManager.getMoney(player)}`,
                '',
                `${FC.Bold}Your Team:`,
                `${FC.Bold}${playerTeamStr}`,
                ''
            ];
        
            HudTextController.add(player, 'sidebar', message);
        }
    }
}