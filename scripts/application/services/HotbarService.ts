import { Player } from "@minecraft/server";
import { HotbarManager, HotbarTemplate } from "../../domain/player/HotbarManager";

export class HotbarService {
    
    static reloadHotbar(player: Player) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        HotbarManager.reloadItems(hotbar);
        HotbarManager.sendHotbar(player, hotbar);
    }

    static clearHotbar(player: Player) {
        HotbarManager.sendHotbar(player);
    }

    static sendDefaultKit(player: Player) {
        HotbarManager.sendHotbar(player, HotbarTemplate.defaultKit(player));
    }

    static sendDefuserKit(player: Player) {
        HotbarManager.sendHotbar(player, HotbarTemplate.defuserKit(player));
    }

    static sendC4Kit(player: Player) {
        HotbarManager.sendHotbar(player, HotbarTemplate.c4Kit(player));
    }
}