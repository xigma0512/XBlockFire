import { PhaseManager } from "../../modules/core/gamephase/PhaseManager";
import { MemberManager } from "../../modules/player/MemberManager";

import { PhaseEnum as BombPlantPhaseEnum } from "../../modules/core/gamephase/BombPlantPhaseEnum";

import { MessageManager as Msg } from "../Message";
import { Language as L } from "../../utils/Language";
import { GameStatusProvider } from "../GameStatusProvider";

import { HudTextController } from "../HudText";

export class ActionHud implements InGameHud {
    
    constructor() { }
    
    update() {
        this.updateGameStatus();
        this.updateSubtitle();
        this.updateSidebar();
    }

    private updateGameStatus() {
        for (const player of MemberManager.getPlayers()) {
            const extraLine = Msg.getRoundEndMessage(player);
            const status = GameStatusProvider.getStatusTitle(player, extraLine);
            // Push with 2 ticks duration to ensure it's continuously updated by the loop
            Msg.title(status, player, 2, "game_status");
        }
    }

    private updateSubtitle() {
        const phase = PhaseManager.getPhase();

        let text: string | string[] = '';
        switch (phase.phaseTag) {
            case BombPlantPhaseEnum.Buying:
                text = L.translate("hud.buying.subtitle");
                break;
        }

        if (text === '') return;
        const members = MemberManager.getPlayers();
        Msg.subtitle(text, members, 2);
    }

    private updateSidebar() {
        HudTextController.setSidebar(GameStatusProvider.getSidebar(true, true));
    }
}
