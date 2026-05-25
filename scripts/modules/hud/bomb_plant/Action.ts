import { PhaseManager } from "../../../base/gamephase/PhaseManager";
import { MemberManager } from "../../../base/member/MemberManager";
import { EconomyManager } from "../../../base/economy/EconomyManager";

import { TeamEnum } from "../../../base/member/TeamEnum";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../base/gamephase/BombPlantPhaseEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { variable } from "../../../utils/Variable";
import { MessageManager as Msg } from "../MessageManager";
import { HudTextController } from "../HudTextController";

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
                text = Msg.translate("hud.buying.subtitle", (phase.currentTick / 20).toFixed(0));
                break;
        }

        if (text === '') return;
        const members = MemberManager.getPlayers();
        Msg.rawSubtitle(text, members, 2);
    }

    private updateSidebar() {
        
        const phase = PhaseManager.getPhase();

        const attackerScore = variable(`attacker_score`);
        const defenderScore = variable(`defender_score`);

        const attackerPlayers = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: true });
        const defenderPlayers = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });

        const attackerDeadPlayers = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: false });
        const defenderDeadPlayers = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: false });

        const seconds = Number((phase.currentTick / 20).toFixed(0));
        
        const message = [
            `   ${Msg.translate("hud.sidebar.round", defenderScore + attackerScore + 1)}  `,
            Msg.translate("hud.sidebar.time", Math.floor(seconds / 60), String(seconds % 60).padStart(2, '0')),
            '',
            `${FC.Aqua}D-${defenderScore} ${FC.White}| ${FC.Bold}${FC.Aqua}${'O '.repeat(defenderPlayers.length)}${FC.Gray}${'X '.repeat(defenderDeadPlayers.length)}`,
            `${FC.Red}A-${attackerScore} ${FC.White}| ${FC.Bold}${FC.Red}${'O '.repeat(attackerPlayers.length)}${FC.Gray}${'X '.repeat(attackerDeadPlayers.length)}`
        ];
    
        HudTextController.setSidebar(message);
    }
}
