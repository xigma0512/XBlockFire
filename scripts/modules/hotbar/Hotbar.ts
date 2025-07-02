import { ItemStack, Player } from "@minecraft/server";
import { Glock17 } from "../weapon/actors/item/Glock17";
import { ActorManager } from "../weapon/systems/ActorManager";
import { ItemActor } from "../weapon/actors/Actor";

export interface IHotbar {
    readonly items: Array<ItemStack|undefined>;
}

class Hotbar {
    
    readonly items: Array<ItemStack|undefined>;
    
    constructor() {
        this.items = new Array(9).fill(undefined);
    }

    copyInventory(target: Player) {
        const container = target.getComponent('inventory')!.container;
        for (let index = 0; index < 9; index ++) {
            this.items[index] = container.getItem(index);
        }
    }

}

export class HotbarManager {

    static getPlayerHotbar(player: Player): IHotbar {
        const hotbar = new Hotbar();
        hotbar.copyInventory(player);
        return hotbar;
    }

    static sendHotbar(target: Player, hotbar: IHotbar) {
        const container = target.getComponent('inventory')!.container;
        for (let index = 0; index < 9; index ++) {
            container.setItem(index, hotbar.items.at(index));
        }
    }

    static resetItemActors(hotbar: IHotbar) {
        for (let index = 0; index < 9; index ++) {
            const item = hotbar.items[index];
            if (item === undefined || !ActorManager.isActor(item)) continue;

            const itemActor = ActorManager.getActor(item) as ItemActor;
            const cloneActor = itemActor.clone();
            hotbar.items[index] = cloneActor.item;

            ActorManager.removeActor(itemActor.uuid);
        }
        return hotbar;
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