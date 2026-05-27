import { gameroom } from "../../modules/core/GameRoom";
import { MemberManager } from "../../modules/player/MemberManager";
import { PhaseManager } from "../../modules/core/gamephase/PhaseManager";
import { MapRegister } from "../../modules/world/MapRegister";

import { TeamEnum } from "../../modules/player/TeamEnum";

import { FormatCode as FC } from "../../utils/FormatCode";
import { MessageManager as Msg } from "../Message";
import { Language as L } from "../../utils/Language";
import { HudTextController } from "../HudText";

import { Config } from "../../settings/config";

const game_config = Config.game;
const idle_config = Config.bombplant.idle;

import { GameStatusProvider } from "../GameStatusProvider";

export class WaitingHud implements InGameHud {
    
    constructor() { }

    update() {
        this.updateSubtitle();
        this.updateSidebar();
    }

    private updateSubtitle() {
        const players = MemberManager.getPlayers();
        const playerAmount = players.length;

        const phase = PhaseManager.getPhase();
        
        let text = L.translate("hud.waiting");
        
        if (game_config.AUTO_START && playerAmount >= game_config.AUTO_START_MIN_PLAYER) {
            text = L.translate("hud.start_in", (phase.currentTick / 20).toFixed(0));
        }
        
        if (phase.currentTick !== idle_config.COUNTDOWN_TIME && playerAmount < game_config.AUTO_START_MIN_PLAYER) {
            Msg.message(L.translate("game.wait_players"), players);
        }
        
        Msg.subtitle(text, players, 2);
    }

    private updateSidebar() {
        HudTextController.setSidebar(GameStatusProvider.getSidebar(true));
    }
}
