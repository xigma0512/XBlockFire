import { Player, world } from "@minecraft/server";
import { FormatCode as FC } from "./FormatCode";

export class Broadcast {
    
    static message(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) p.sendMessage(message);
    }

    static actionbar(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) p.onScreenDisplay.setActionBar(message);
    }

    static updatebar(topbar: string[], sidebar: string[], players: Player[]) {
        let topbarMessage: string | string[] = topbar.map((m, i) => (i == topbar.length - 1) ? m : m + '\n' + FC.Reset);
        let sidebarMessage = sidebar.map((m, i) => (i == sidebar.length - 1) ? m : m + '\n' + FC.Reset);

        if (topbar.length == 0) topbarMessage = '\u{E107}';
        
        for (const p of (players ?? world.getAllPlayers())) {
            p.onScreenDisplay.setTitle(topbarMessage, {
                fadeInDuration: 0,
                fadeOutDuration: 0,
                stayDuration: 0,
                subtitle: sidebarMessage
            });
        }
    }

}