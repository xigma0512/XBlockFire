import { FormatCode } from "../utils/FormatCode";
import { Player, system, world, DisplaySlotId, ScoreboardObjective } from "@minecraft/server";
import { Language as L } from "../utils/Language";

export interface HudMessage {
    text: string;
    expireTick: number;
    category: string;
}

class _HudTextController {
    private static _instance: _HudTextController;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private titleQueue = new Map<Player, HudMessage[]>();
    private subtitleQueue = new Map<Player, HudMessage[]>();
    private actionbarQueue = new Map<Player, HudMessage[]>();
    private previousSidebarLines: string[] = [];

    // Tracks what's currently being shown to avoid redundant updates
    private lastTitleText = new Map<Player, string>();
    private lastSubtitleText = new Map<Player, string>();
    private lastActionbarText = new Map<Player, string>();

    private constructor() {
        system.runInterval(this.update.bind(this));
        world.afterEvents.playerLeave.subscribe((ev) => this.cleanupPlayer(ev.playerName));
    }

    private cleanupPlayer(playerName: string) {
        const queues = [this.titleQueue, this.subtitleQueue, this.actionbarQueue];
        const lastTexts = [this.lastTitleText, this.lastSubtitleText, this.lastActionbarText];
        
        for (const queue of queues) {
            for (const [player] of queue) {
                if (player.name === playerName) queue.delete(player);
            }
        }
        for (const lastText of lastTexts) {
            for (const [player] of lastText) {
                if (player.name === playerName) lastText.delete(player);
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
        // Clear all existing actionbar messages for this player to prevent overlap
        this.actionbarQueue.set(player, []);
        this.pushMessage(player, this.actionbarQueue, text, duration, category);
    }

    private pushMessage(player: Player, queueMap: Map<Player, HudMessage[]>, text: string, duration: number, category: string) {
        if (!queueMap.has(player)) queueMap.set(player, []);
        const queue = queueMap.get(player)!;
        const now = system.currentTick;
        const expireTick = now + duration;

        // Category logic: 
        // 1. If category is "default", we allow stacking but deduplicate same text.
        // 2. If category is custom, we remove ANY existing message with that category.
        
        if (category === "default") {
            const existing = queue.find(m => m.text === text && m.category === "default");
            if (existing) {
                existing.expireTick = Math.max(existing.expireTick, expireTick);
                return;
            }
        } else {
            const index = queue.findIndex(m => m.category === category);
            if (index !== -1) {
                queue.splice(index, 1);
            }
        }

        queue.push({ text, expireTick, category });
    }

    private getSidebarObjective(): ScoreboardObjective {
        let obj = world.scoreboard.getObjective('xblockfire_sidebar');
        if (!obj) {
            obj = world.scoreboard.addObjective('xblockfire_sidebar', L.translate('system.name'));
        }
        return obj;
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

        // Diff Algorithm:
        // 1. Get current participants from the actual scoreboard to ensure we don't leak entries
        const currentParticipants = obj.getParticipants().map(p => p.displayName);
        
        // 2. Remove lines that are on the scoreboard but not in the new list
        for (const participantName of currentParticipants) {
            if (!uniqueLines.includes(participantName)) {
                try { obj.removeParticipant(participantName); } catch {}
            }
        }

        // 3. Set scores for all lines. 
        let score = uniqueLines.length;
        for (const line of uniqueLines) {
            try {
                // Only set if score actually changed to minimize packets
                const currentScore = obj.getScore(line);
                if (currentScore !== score) {
                    obj.setScore(line, score);
                }
            } catch {
                obj.setScore(line, score);
            }
            score--;
        }

        this.previousSidebarLines = uniqueLines;
    }

    clearSidebar() {
        const obj = world.scoreboard.getObjective('xblockfire_sidebar');
        if (!obj) return;

        for (const participant of obj.getParticipants()) {
            try { obj.removeParticipant(participant); } catch {}
        }
        this.previousSidebarLines = [];
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

        const lastTitle = this.lastTitleText.get(player) || "";
        const lastSubtitle = this.lastSubtitleText.get(player) || "";

        if (titleText !== lastTitle || subtitleText !== lastSubtitle) {
            try {
                player.onScreenDisplay.setTitle(titleText || " ", {
                    subtitle: subtitleText || " ",
                    fadeInDuration: 0,
                    fadeOutDuration: 0,
                    stayDuration: 20000000 // A very long time
                });
                this.lastTitleText.set(player, titleText);
                this.lastSubtitleText.set(player, subtitleText);
            } catch {}
        }
    }

    private updateActionbar(player: Player) {
        const actionbarText = this.getActiveMessageText(player, this.actionbarQueue) || "";
        const lastActionbar = this.lastActionbarText.get(player) || "";

        if (actionbarText !== lastActionbar) {
            try {
                // To "clear" actionbar, we send an empty string or just stop sending.
                // Bedrock actionbar clears after ~3 seconds if not updated, 
                // but we can force update with empty space to clear.
                player.onScreenDisplay.setActionBar(actionbarText);
                this.lastActionbarText.set(player, actionbarText);
            } catch {}
        }
    }

    private getActiveMessageText(player: Player, queueMap: Map<Player, HudMessage[]>): string | undefined {
        if (!queueMap.has(player)) return undefined;
        const messages = queueMap.get(player)!;
        const now = system.currentTick;
        
        // Filter out expired messages
        const activeMessages = messages.filter(m => m.expireTick > now);
        
        // Update the queue if any messages expired
        if (activeMessages.length !== messages.length) {
            queueMap.set(player, activeMessages);
        }
        
        if (activeMessages.length > 0) {
            return activeMessages.map(m => m.text).join(`\n${FormatCode.Reset}`);
        }
        return undefined;
    }
}

export const HudTextController = _HudTextController.instance;
