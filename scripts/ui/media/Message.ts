import { Player, PlayerSoundOptions, world } from "@minecraft/server";
import { HudDriver } from "../hud/drivers/HudDriver";
import { TeamEnum } from "../../modules/player/TeamEnum";
import { UiStateManager } from "../hud/state/UiState";

export type MessageTarget = Player | Player[] | undefined;

export class MessageManager {

    private static getPlayers(target: MessageTarget): Player[] {
        if (target === undefined) return world.getAllPlayers();
        return Array.isArray(target) ? target : [target];
    }

    /**
     * 發送訊息
     */
    static message(message: string | string[], target?: MessageTarget) {
        for (const p of this.getPlayers(target)) p.sendMessage(message);
    }

    /**
     * 發送 Title 訊息
     */
    static title(message: string | string[], target?: MessageTarget, duration: number = 60, category: string = "default") {
        const text = Array.isArray(message) ? message.join('\n') : message;
        for (const p of this.getPlayers(target)) {
            HudDriver.pushTitle(p, text, duration, category);
        }
    }

    /**
     * 發送 ActionBar 訊息
     */
    static actionbar(message: string | string[], target?: MessageTarget, duration: number = 60, category: string = "default") {
        const text = Array.isArray(message) ? message.join('\n') : message;
        for (const p of this.getPlayers(target)) {
            HudDriver.pushActionbar(p, text, duration, category);
        }
    }

    /**
     * 發送 Subtitle 訊息
     */
    static subtitle(message: string | string[], target?: MessageTarget, duration: number = 60, category: string = "default") {
        const text = Array.isArray(message) ? message.join('\n') : message;
        for (const p of this.getPlayers(target)) {
            HudDriver.pushSubtitle(p, text, duration, category);
        }
    }

    /**
     * 廣播回合結束通知 (委託給 UiStateManager)
     */
    static broadcastRoundEnd(winner: TeamEnum, isGameOver: boolean = false) {
        UiStateManager.setRoundEndMessage(winner, isGameOver);
    }

    /**
     * 播放音效
     */
    static sound(soundId: string, options: PlayerSoundOptions, target?: MessageTarget) {
        for (const p of this.getPlayers(target)) {
            p.playSound(soundId, options);
        }
    }
}
