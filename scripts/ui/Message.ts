import { Player, PlayerSoundOptions, world } from "@minecraft/server";
import { HudTextController } from "./HudText";

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
            HudTextController.pushTitle(p, text, duration, category);
        }
    }

    /**
     * 發送 ActionBar 訊息
     */
    static actionbar(message: string | string[], target?: MessageTarget, duration: number = 60, category: string = "default") {
        const text = Array.isArray(message) ? message.join('\n') : message;
        for (const p of this.getPlayers(target)) {
            HudTextController.pushActionbar(p, text, duration, category);
        }
    }

    /**
     * 發送 Subtitle 訊息
     */
    static subtitle(message: string | string[], target?: MessageTarget, duration: number = 60, category: string = "default") {
        const text = Array.isArray(message) ? message.join('\n') : message;
        for (const p of this.getPlayers(target)) {
            HudTextController.pushSubtitle(p, text, duration, category);
        }
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
