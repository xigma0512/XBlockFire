import { Glock17 } from "../../base/weapon/actors/item/Glock17";
import { ActorManager } from "../../base/weapon/systems/ActorManager";
import { ItemActor } from "../../base/weapon/actors/Actor";
import { ItemStackFactory } from "../../utils/ItemStackFactory";

import { ItemLockMode, ItemStack, Player } from "@minecraft/server";

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

    static resetItems(hotbar: IHotbar) {
        for (let index = 0; index < 9; index ++) {
            const item = hotbar.items[index];
            if (item === undefined) continue;

            if (ActorManager.isActor(item)) {   
                const itemActor = ActorManager.getActor(item) as ItemActor;
                const cloneActor = itemActor.clone();
                hotbar.items[index] = cloneActor.item;
                
                ActorManager.removeActor(itemActor.uuid);
            } else {

                const itemInfo = {
                    typeId: item.typeId,
                    amount: item.amount,
                    nametag: item.nameTag,
                    lore: item.getLore(),
                    keepOnDeath: item.keepOnDeath,
                    lockMode: item.lockMode,
                    canDestroy: item.getCanDestroy(),
                    canPlaceOn: item.getCanPlaceOn()
                };

                const newItem = ItemStackFactory.new(itemInfo);
                hotbar.items[index] = newItem;
            }
        }
        return hotbar;
    }

}

export class HotbarTemplate {
    static initSpawn() {
        const hotbar = new Hotbar();
        
        hotbar.items[1] = new Glock17().item;
        hotbar.items[2] = ItemStackFactory.new({ typeId: 'minecraft:diamond_sword', lockMode: ItemLockMode.slot });
        
        return hotbar;
    }
}