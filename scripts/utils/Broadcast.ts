import { Player, world } from "@minecraft/server";
import { HudTextController } from "../modules/hud/HudTextController";

export class Broadcast {
    
    static message(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) p.sendMessage(message);
    }

    static actionbar(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) {
            HudTextController.add(p, 'actionbar', message);
        }
    }

    static sidebar(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) {
            HudTextController.add(p, 'sidebar', message);
        }
    }

    static subtitle(message: string | string[], players?: Player[]) {
        for (const p of (players ?? world.getAllPlayers())) {
            HudTextController.add(p, 'subtitle', message);
        }
    }

}