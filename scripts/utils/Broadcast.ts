import { Player, world } from "@minecraft/server";

export class Broadcast {
    
    static message(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) p.sendMessage(message);
    }

    static actionbar(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) p.onScreenDisplay.setActionBar(message);
    }

    static sidebar(message: string[], players?: Player[]) {
        let maxLength = -1;
        message.forEach(msg => maxLength = Math.max(maxLength, msg.length));
        message.map(msg => msg += ' '.repeat(maxLength - msg.length) + ' '.repeat(4));
        for (const p of (players ?? world.getAllPlayers())) p.onScreenDisplay.setTitle(message);
    }

}