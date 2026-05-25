import { Player, PlayerSoundOptions, world } from "@minecraft/server";
import { HudTextController } from "./HudTextController";
import { zh_TW } from "../../settings/lang/zh_TW";
import { LanguageKey } from "../../settings/lang/LanguageKey";

export type MessageTarget = Player | Player[] | undefined;

export class MessageManager {
    private static readonly dictionary = zh_TW;

    /**
     * 取得翻譯字串並替換佔位符
     */
    static translate(key: LanguageKey, ...args: (string | number)[]): string {
        const value = this.dictionary[key];
        if (!value) return key;

        let text = Array.isArray(value) ? value.join('\n') : value;

        args.forEach((val, index) => {
            text = text.replace(new RegExp(`%${index + 1}`, 'g'), val.toString());
        });

        return text;
    }

    /**
     * 取得帶有系統前綴的翻譯字串
     */
    static translateWithPrefix(key: LanguageKey, ...args: (string | number)[]): string {
        return this.translate("system.prefix") + this.translate(key, ...args);
    }

    private static getPlayers(target: MessageTarget): Player[] {
        if (target === undefined) return world.getAllPlayers();
        return Array.isArray(target) ? target : [target];
    }

    /**
     * 使用語言系統發送訊息 (預設)
     */
    static message(key: LanguageKey, target?: MessageTarget, ...args: (string | number)[]) {
        this.rawMessage(this.translate(key, ...args), target);
    }

    /**
     * 發送原始字串訊息
     */
    static rawMessage(message: string | string[], target?: MessageTarget) {
        for (const p of this.getPlayers(target)) p.sendMessage(message);
    }

    /**
     * 使用語言系統發送 ActionBar 訊息 (預設)
     */
    static actionbar(key: LanguageKey, target?: MessageTarget, ...args: (string | number)[]) {
        this.rawActionbar(this.translate(key, ...args), target);
    }

    /**
     * 發送原始字串 ActionBar 訊息
     */
    static rawActionbar(message: string | string[], target?: MessageTarget, duration: number = 60) {
        const text = Array.isArray(message) ? message.join('\n') : message;
        for (const p of this.getPlayers(target)) {
            HudTextController.pushActionbar(p, text, duration);
        }
    }

    /**
     * 使用語言系統發送 Subtitle 訊息 (預設)
     */
    static subtitle(key: LanguageKey, target?: MessageTarget, ...args: (string | number)[]) {
        this.rawSubtitle(this.translate(key, ...args), target);
    }

    /**
     * 發送原始字串 Subtitle 訊息
     */
    static rawSubtitle(message: string | string[], target?: MessageTarget, duration: number = 60) {
        const text = Array.isArray(message) ? message.join('\n') : message;
        for (const p of this.getPlayers(target)) {
            HudTextController.pushSubtitle(p, text, duration);
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
