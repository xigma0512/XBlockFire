import { FormatCode } from "../../utils/FormatCode";
import { Player, system, world, DisplaySlotId, ScoreboardObjective } from "@minecraft/server";
import { MessageManager } from "../Message";
import { Language as L } from "../../utils/Language";

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

    private constructor() {
        system.runInterval(this.update.bind(this));
        world.afterEvents.playerLeave.subscribe((ev) => this.cleanupPlayer(ev.playerName));
    }

    private cleanupPlayer(playerName: string) {
        const queues = [this.titleQueue, this.subtitleQueue, this.actionbarQueue];
        for (const queue of queues) {
            for (const [player] of queue) {
                if (player.name === playerName) queue.delete(player);
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
        // 1. Remove lines that are in previous but not in new
        for (const oldLine of this.previousSidebarLines) {
            if (!uniqueLines.includes(oldLine)) {
                try { obj.removeParticipant(oldLine); } catch {}
            }
        }

        // 2. Set scores for all lines. 
        // Minecraft scoreboard only updates if the score OR the objective display changes.
        // By setting the score (which is the position), we ensure order.
        let score = uniqueLines.length;
        for (const line of uniqueLines) {
            try {
                // Only set if score actually changed or it's a new line to minimize packets
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

    private update() {
        for (const player of world.getAllPlayers()) {
            const title = this.getActiveMessage(player, this.titleQueue);
            const subtitle = this.getActiveMessage(player, this.subtitleQueue);

            if (title || subtitle) {
                try {
                    player.onScreenDisplay.setTitle(title || " ", {
                        subtitle: subtitle || " ",
                        fadeInDuration: 0,
                        fadeOutDuration: 0,
                        stayDuration: 20
                    });
                } catch {}
            }

            this.updatePlayerHud(player, this.actionbarQueue, (text) => {
                try { player.onScreenDisplay.setActionBar(text); } catch {}
            });
        }
    }

    private getActiveMessage(player: Player, queueMap: Map<Player, HudMessage[]>): string | undefined {
        if (!queueMap.has(player)) return undefined;
        const messages = queueMap.get(player)!;
        const now = system.currentTick;
        const activeMessages = messages.filter(m => m.expireTick > now);
        
        if (activeMessages.length !== messages.length) {
            queueMap.set(player, activeMessages);
        }
        
        if (activeMessages.length > 0) {
            return activeMessages.map(m => m.text).join(`\n${FormatCode.Reset}`);
        }
        return undefined;
    }

    private updatePlayerHud(player: Player, queueMap: Map<Player, HudMessage[]>, displayFn: (text: string) => void) {
        const text = this.getActiveMessage(player, queueMap);
        if (text) {
            displayFn(text);
        }
    }
}

export const HudTextController = _HudTextController.instance;
