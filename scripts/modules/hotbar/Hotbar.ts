import { ItemStack, Player } from "@minecraft/server";
import { Glock17 } from "../weapon/actors/item/Glock17";

export interface IHotbar {
    readonly items: Array<ItemStack|undefined>;
}

class Hotbar {
    
    readonly items: Array<ItemStack|undefined>;
    
    constructor() {
        this.items = new Array(9).fill(undefined);
    }

    copy(target: Player) {
        const container = target.getComponent('inventory')!.container;
        for (let index = 0; index < 9; index ++) {
            this.items[index] = container.getItem(index);
        }
    }
}

export class HotbarManager {

    static getPlayerHotbar(player: Player): IHotbar {
        const hotbar = new Hotbar();
        hotbar.copy(player);
        return hotbar;
    }

    static sendHotbar(target: Player, hotbar: IHotbar) {
        const container = target.getComponent('inventory')!.container;
        for (let index = 0; index < 9; index ++) {
            container.setItem(index, hotbar.items.at(index));
        }
    }
}

export class HotbarTemplate {
    static initSpawn(isDefender: boolean) {
        const hotbar = new Hotbar();
        
        hotbar.items[1] = new Glock17().item;
        hotbar.items[2] = new ItemStack('minecraft:diamond_sword');
        hotbar.items[3] = isDefender ? new ItemStack('xblockfire:defuser') : undefined;
        
        return hotbar;
    }
}