import { Player, system, world, DisplaySlotId, ScoreboardObjective } from "@minecraft/server";
import { Language as L } from "../../../utils/Language";
import { FormatCode } from "../../../utils/FormatCode";

export interface HudMessage {
    text: string;
    expireTick: number;
    category: string;
}

class _HudDriver {
    private static _instance: _HudDriver;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private titleQueue = new Map<Player, HudMessage[]>();
    private subtitleQueue = new Map<Player, HudMessage[]>();
    private actionbarQueue = new Map<Player, HudMessage[]>();
    
    private lastTitleText = new Map<Player, string>();
    private lastSubtitleText = new Map<Player, string>();
    private lastActionbarText = new Map<Player, string>();

    private constructor() {
        system.runInterval(this.update.bind(this));
        world.afterEvents.playerLeave.subscribe((ev) => this.cleanupPlayer(ev.playerName));
    }

    private cleanupPlayer(playerName: string) {
        const maps = [this.titleQueue, this.subtitleQueue, this.actionbarQueue, this.lastTitleText, this.lastSubtitleText, this.lastActionbarText];
        for (const map of maps) {
            for (const [player] of map) {
                if (player.name === playerName) map.delete(player);
            }
        }
    }

    pushTitle(player: Player, text: string, duration: number, category: string = "default") {
        this.pushMessage(player, this.titleQueue, text, duration, category);
    }

    pushSubtitle(player: Player, text: string, duration: number, category: string = "default") {
        this.pushMessage(player, this.subtitleQueue, text, duration, category);
    }

    pushActionbar(player: Player, text: string, duration: number, category: string = "default") {
        this.actionbarQueue.set(player, []); // Last one wins logic
        this.pushMessage(player, this.actionbarQueue, text, duration, category);
    }

    private pushMessage(player: Player, queueMap: Map<Player, HudMessage[]>, text: string, duration: number, category: string) {
        if (!queueMap.has(player)) queueMap.set(player, []);
        const queue = queueMap.get(player)!;
        const now = system.currentTick;
        const expireTick = now + duration;

        if (category === "default") {
            const existing = queue.find(m => m.text === text && m.category === "default");
            if (existing) {
                existing.expireTick = Math.max(existing.expireTick, expireTick);
                return;
            }
        } else {
            const index = queue.findIndex(m => m.category === category);
            if (index !== -1) queue.splice(index, 1);
        }

        queue.push({ text, expireTick, category });
    }

    setSidebar(lines: string[]) {
        const obj = this.getSidebarObjective();
        try { world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { objective: obj }); } catch {}

        const uniqueLines: string[] = [];
        const spacesCount = new Map<string, number>();
        for (let line of lines) {
            if (line.trim() === '') {
                const count = (spacesCount.get('') || 0) + 1;
                spacesCount.set('', count);
                line = ' '.repeat(count);
            }
            uniqueLines.push(line);
        }

        const currentParticipants = obj.getParticipants().map(p => p.displayName);
        for (const pName of currentParticipants) {
            if (!uniqueLines.includes(pName)) try { obj.removeParticipant(pName); } catch {}
        }

        let score = uniqueLines.length;
        for (const line of uniqueLines) {
            try {
                if (obj.getScore(line) !== score) obj.setScore(line, score);
            } catch {
                obj.setScore(line, score);
            }
            score--;
        }
    }

    clearSidebar() {
        this.setSidebar([]);
    }

    private getSidebarObjective(): ScoreboardObjective {
        let obj = world.scoreboard.getObjective('xblockfire_sidebar');
        if (!obj) obj = world.scoreboard.addObjective('xblockfire_sidebar', L.translate('system.name'));
        return obj;
    }

    private update() {
        for (const player of world.getAllPlayers()) {
            this.updateTitleSubtitle(player);
            this.updateActionbar(player);
        }
    }

    private updateTitleSubtitle(player: Player) {
        const titleText = this.getActiveMessageText(player, this.titleQueue) || "";
        const subtitleText = this.getActiveMessageText(player, this.subtitleQueue) || "";

        if (titleText !== (this.lastTitleText.get(player) || "") || subtitleText !== (this.lastSubtitleText.get(player) || "")) {
            try {
                player.onScreenDisplay.setTitle(titleText || " ", {
                    subtitle: subtitleText || " ",
                    fadeInDuration: 0, fadeOutDuration: 0, stayDuration: 20000000
                });
                this.lastTitleText.set(player, titleText);
                this.lastSubtitleText.set(player, subtitleText);
            } catch {}
        }
    }

    private updateActionbar(player: Player) {
        const text = this.getActiveMessageText(player, this.actionbarQueue) || "";
        if (text !== (this.lastActionbarText.get(player) || "")) {
            try {
                player.onScreenDisplay.setActionBar(text);
                this.lastActionbarText.set(player, text);
            } catch {}
        }
    }

    private getActiveMessageText(player: Player, queueMap: Map<Player, HudMessage[]>): string | undefined {
        if (!queueMap.has(player)) return undefined;
        const messages = queueMap.get(player)!;
        const now = system.currentTick;
        const active = messages.filter(m => m.expireTick > now);
        if (active.length !== messages.length) queueMap.set(player, active);
        if (active.length > 0) return active.map(m => m.text).join(`\n${FormatCode.Reset}`);
        return undefined;
    }
}

export const HudDriver = _HudDriver.instance;
