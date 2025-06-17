import { Player, world } from "@minecraft/server";

const sidebarMessages = new Map<Player, string[]>();
const topbarMessages = new Map<Player, string[]>();

export class Broadcast {
    
    static message(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) p.sendMessage(message);
    }

    static actionbar(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) p.onScreenDisplay.setActionBar(message);
    }

    static topbar(message: string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) {
            topbarMessages.set(p, message);
            this.sendTitle(p);
        }
    }

    static sidebar(message: string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) {
            sidebarMessages.set(p, message);
            this.sendTitle(p);
        }
    }

    private static sendTitle(player: Player) {
        if (!sidebarMessages.has(player)) sidebarMessages.set(player, ['']);
        if (!topbarMessages.has(player)) topbarMessages.set(player, ['']);

        player.onScreenDisplay.setTitle(topbarMessages.get(player)!, {
            fadeInDuration: 0,
            fadeOutDuration: 0,
            stayDuration: 0,
            subtitle: sidebarMessages.get(player)!
        });
    }

}