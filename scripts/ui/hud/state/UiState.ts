import { Player, system } from '@minecraft/server';
import { PhaseManager } from '../../../modules/core/gamephase/PhaseManager';
import { PhaseEnum as BombPlantPhaseEnum } from '../../../modules/core/gamemodes/BombPlant/phases/BombPlantPhaseEnum';
import { TeamEnum } from '../../../modules/player/TeamEnum';
import { MemberManager } from '../../../modules/player/MemberManager';
import { Language as L } from '../../../utils/Language';
import { FormatCode as FC } from '../../../utils/FormatCode';

export interface UiMessage {
    text: string;
    expireTick: number;
}

class _UiStateManager {
    private static _instance: _UiStateManager;
    static get instance() {
        return this._instance || (this._instance = new this());
    }

    private roundEndMessages = new Map<Player, UiMessage>();
    private notifyMessages = new Map<Player, UiMessage>();

    setRoundEndMessage(winner: TeamEnum, isGameOver: boolean = false) {
        const now = system.currentTick;
        const duration = 6 * 20;
        const expireTick = now + duration;

        for (const player of MemberManager.getPlayers()) {
            const playerTeam = MemberManager.getPlayerTeam(player);
            const isWinner = playerTeam === winner;
            const color = isWinner ? FC.Green : FC.Red;

            function box(title: string, content: string | string[], footer: string = '--------------------'): string[] {
                const lines = [
                    `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ ${title} ] ${FC.Gray}----`,
                    ...(Array.isArray(content) ? content : [content]),
                    `${FC.Bold}${FC.Gray}${footer}`,
                ];
                return lines;
            }

            let winText: string;
            if (isGameOver) {
                winText =
                    winner === TeamEnum.Attacker
                        ? L.translate('game.over.attacker_win')
                        : L.translate('game.over.defender_win');
            } else {
                winText = isWinner ? L.translate('round.end.win') : L.translate('round.end.loss');
            }

            const cleanText = Array.isArray(winText) ? winText.join('\n') : winText;
            this.roundEndMessages.set(player, { text: `${color}${FC.Bold}${cleanText}`, expireTick });
        }
    }

    getRoundEndMessage(player: Player): string | undefined {
        const data = this.roundEndMessages.get(player);
        if (!data) return undefined;

        const phase = PhaseManager.getPhase().phaseId;
        const isPersistentPhase = phase === BombPlantPhaseEnum.RoundEnd || phase === BombPlantPhaseEnum.Gameover;

        if (isPersistentPhase || system.currentTick <= data.expireTick) {
            return data.text;
        }

        this.roundEndMessages.delete(player);
        return undefined;
    }

    /**
     * 設定通知訊息 (廣播給所有玩家)
     */
    setNotifyMessage(text: string, duration: number = 5 * 20) {
        const expireTick = system.currentTick + duration;
        for (const player of MemberManager.getPlayers()) {
            this.notifyMessages.set(player, { text, expireTick });
        }
    }

    /**
     * 獲取當前有效的通知訊息
     */
    getNotifyMessage(player: Player): string | undefined {
        const data = this.notifyMessages.get(player);
        if (!data) return undefined;

        if (system.currentTick <= data.expireTick) {
            return data.text;
        }

        this.notifyMessages.delete(player);
        return undefined;
    }

    clearState() {
        this.roundEndMessages.clear();
        this.notifyMessages.clear();
    }
}

export const UiStateManager = _UiStateManager.instance;
