import { Player, world } from "@minecraft/server";

export class Broadcast {
    
    static message(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) p.sendMessage(message);
    }

    static actionbar(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) p.onScreenDisplay.setActionBar(message);
    }

}