import { FormatCode } from "../utils/FormatCode";
import { Player, system, world, DisplaySlotId, ScoreboardObjective } from "@minecraft/server";

export interface HudMessage {
    text: string;
    expireTick: number;
    category: string;
}

class _HudTextController {
    private static _instance: _HudTextController;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private subtitleQueue = new Map<Player, HudMessage[]>();
    private actionbarQueue = new Map<Player, HudMessage[]>();
    private previousSidebarLines: string[] = [];

    private constructor() {
        system.runInterval(this.update.bind(this));
        world.afterEvents.playerLeave.subscribe((ev) => this.cleanupPlayer(ev.playerName));
    }

    private cleanupPlayer(playerName: string) {
        for (const [player] of this.subtitleQueue) {
            if (player.name === playerName) this.subtitleQueue.delete(player);
        }
        for (const [player] of this.actionbarQueue) {
            if (player.name === playerName) this.actionbarQueue.delete(player);
        }
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
            obj = world.scoreboard.addObjective('xblockfire_sidebar', 'XBlockFire');
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

        const previous = this.previousSidebarLines;
        for (const oldLine of previous) {
            if (!uniqueLines.includes(oldLine)) {
                try { obj.removeParticipant(oldLine); } catch {}
            }
        }

        let score = 15;
        for (const line of uniqueLines) {
            try { obj.setScore(line, score); } catch {}
            score--;
        }

        this.previousSidebarLines = uniqueLines;
    }

    private update() {
        for (const player of world.getAllPlayers()) {
            this.updatePlayerHud(player, this.subtitleQueue, (text) => {
                try { player.onScreenDisplay.setTitle(" ", { subtitle: text, fadeInDuration: 0, fadeOutDuration: 0, stayDuration: 20 }); } catch {}
            });
            this.updatePlayerHud(player, this.actionbarQueue, (text) => {
                try { player.onScreenDisplay.setActionBar(text); } catch {}
            });
        }
    }

    private updatePlayerHud(player: Player, queueMap: Map<Player, HudMessage[]>, displayFn: (text: string) => void) {
        if (!queueMap.has(player)) return;
        const messages = queueMap.get(player)!;
        const now = system.currentTick;
        const activeMessages = messages.filter(m => m.expireTick > now);
        
        if (activeMessages.length !== messages.length) {
            queueMap.set(player, activeMessages);
        }
        
        if (activeMessages.length > 0) {
            displayFn(activeMessages.map(m => m.text).join(`\n${FormatCode.Reset}`));
        }
    }
}

export const HudTextController = _HudTextController.instance;
