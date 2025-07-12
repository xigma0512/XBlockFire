import { PhaseManager } from "../../../base/gamephase/PhaseManager";
import { MemberManager } from "../../../base/gameroom/member/MemberManager";
import { EconomyManager } from "../../../base/gameroom/economy/EconomyManager";
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
            case BombPlantPhaseEnum.RoundEnd:
                text = `${FC.Yellow}Next round start in ${(phase.currentTick / 20).toFixed(0)} seconds.`;
                break;
            case BombPlantPhaseEnum.Gameover:
                text = `${FC.Yellow}Return lobby in ${(phase.currentTick / 20).toFixed(0)}`;
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

        const seconds = Number((phase.currentTick / 20).toFixed(0));
        
        for (const player of players) {

            const playerTeam = entity_dynamic_property(player, 'player:team');
            const playerTeamStr = (playerTeam === TeamEnum.Attacker) ? `${FC.Red}Attacker` : `${FC.Aqua}Defender`;

            const message = [
                `${FC.Bold}${FC.Yellow}   XBlockFire   `,
                '',
                `Round Time: ${FC.Gray}${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
                '',
                `${FC.Bold}${FC.Aqua}Defenders - ${defenderScore}`,
                `${defenderPlayers.length} alive`,
                '',
                `${FC.Bold}${FC.Red}Attackers - ${attackerScore}`,
                `${attackerPlayers.length} alive`,
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