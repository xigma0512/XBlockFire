import { Player, PlayerSoundOptions, world, system } from "@minecraft/server";
import { HudTextController } from "./HudText";
import { TeamEnum } from "../modules/player/TeamEnum";
import { MemberManager } from "../modules/player/MemberManager";
import { PhaseManager } from "../modules/core/gamephase/PhaseManager";
import { PhaseEnum as BombPlantPhaseEnum } from "../modules/core/gamephase/BombPlantPhaseEnum";
import { Language as L } from "../utils/Language";
import { FormatCode as FC } from "../utils/FormatCode";

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

    private static currentRoundEndMessage = new Map<Player, { text: string, expireTick: number }>();

    /**
     * 廣播回合結束通知
     */
    static broadcastRoundEnd(winner: TeamEnum, isGameOver: boolean = false) {
        const now = system.currentTick;
        const duration = 10 * 20; // Default 10s if not in specific phase
        const expireTick = now + duration;

        for (const player of MemberManager.getPlayers()) {
            const playerTeam = MemberManager.getPlayerTeam(player);
            const isWinner = playerTeam === winner;
            const color = isWinner ? FC.Green : FC.Red;
            
            let winText: string;
            if (isGameOver) {
                winText = winner === TeamEnum.Attacker ? L.translate("game.over.attacker_win") : L.translate("game.over.defender_win");
                // Flatten array if it's a multiline translation (Gameover translations are arrays)
                if (Array.isArray(winText)) winText = winText.find(l => l.includes("贏得了")) || winText[0];
            } else {
                winText = winner === TeamEnum.Attacker ? L.translate("round.end.attacker_win") : L.translate("round.end.defender_win");
            }
            
            // Clean up winText if it's still an array or has prefix
            const cleanText = Array.isArray(winText) ? winText.join(" ") : winText;

            this.currentRoundEndMessage.set(player, { text: `${color}${FC.Bold}${cleanText}`, expireTick });
        }
    }

    static getRoundEndMessage(player: Player): string | undefined {
        const data = this.currentRoundEndMessage.get(player);
        if (!data) return undefined;

        // Persist if in RoundEnd or Gameover phase
        const phase = PhaseManager.getPhase().phaseTag;
        const isPersistentPhase = phase === BombPlantPhaseEnum.RoundEnd || phase === BombPlantPhaseEnum.Gameover;

        if (isPersistentPhase || system.currentTick <= data.expireTick) {
            return data.text;
        }

        this.currentRoundEndMessage.delete(player);
        return undefined;
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
