import { PhaseManager } from "../../../base/gamephase/PhaseManager";
import { MemberManager } from "../../../base/member/MemberManager";
import { EconomyManager } from "../../../base/economy/EconomyManager";
import { HudTextController } from "../HudTextController";

import { TeamEnum } from "../../../types/TeamEnum";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { entity_dynamic_property } from "../../../utils/Property";
import { variable } from "../../../utils/Variable";
import { Broadcast } from "../../../utils/Broadcast";

export class ActionHud implements InGameHud {
    
    constructor() { }
    
    update() {
        this.updateSubtitle();
        this.updateSidebar();
    }

    private updateSubtitle() {
        
        const phase = PhaseManager.getPhase();

        let text: string | string[] = '';
        switch (phase.phaseTag) {
            case BombPlantPhaseEnum.Buying:
                text = [
                    `> ${(phase.currentTick / 20).toFixed(0)} <`, 
                    `Right-click the feather to open the shop.`
                ];
                break;
        }

        if (text === '') return;
        const members = MemberManager.getPlayers();
        Broadcast.subtitle(text, members);
    }

    private updateSidebar() {
        
        const players = MemberManager.getPlayers();
        const phase = PhaseManager.getPhase();

        const attackerScore = variable(`attacker_score`);
        const defenderScore = variable(`defender_score`);

        const attackerPlayers = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: true });
        const defenderPlayers = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });

        const attackerDeadPlayers = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: false });
        const defenderDeadPlayers = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: false });

        const seconds = Number((phase.currentTick / 20).toFixed(0));
        
        for (const player of players) {

            const playerTeam = entity_dynamic_property(player, 'player:team');
            const playerTeamStr = (playerTeam === TeamEnum.Attacker) ? `${FC.Red}Attacker` : `${FC.Aqua}Defender`;

            const message = [
                `${FC.Bold}   ${FC.Gold}Round ${defenderScore + attackerScore + 1}${FC.Reset}  `,
                `Round Time: ${FC.Gray}${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
                '',
                `${FC.Aqua}D-${defenderScore} ${FC.White}| ${FC.Bold}${FC.Aqua}${'O '.repeat(defenderPlayers.length)}${FC.Gray}${'X '.repeat(defenderDeadPlayers.length)}`,
                `${FC.Red}A-${attackerScore} ${FC.White}| ${FC.Bold}${FC.Red}${'O '.repeat(attackerPlayers.length)}${FC.Gray}${'X '.repeat(attackerDeadPlayers.length)}`,
                '',
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