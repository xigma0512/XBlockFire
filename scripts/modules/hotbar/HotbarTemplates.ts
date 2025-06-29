import { Glock17 } from "../weapon/actors/item/Glock17";
import { Hotbar } from "./Hotbar";

import { ItemStack } from "@minecraft/server";

export class HotbarTemplate {
    static initSpawn(isDefender: boolean) {
        const hotbar = new Hotbar();
        return hotbar.set(1, new Glock17().item)
                     .set(2, new ItemStack('minecraft:diamond_sword'))
                     .set(3, isDefender ? new ItemStack('xblockfire:defuser') : undefined);
    }
}