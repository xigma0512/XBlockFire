import { EconomyManager } from "../../domain/economy/EconomyManager";
import { GamePhaseManager } from "../../domain/fsm/gamephase/GamePhaseManager";
import { MemberManager } from "../../domain/player/MemberManager";
import { HotbarManager } from "../player/HotbarManager";

import { Glock17 } from "../../domain/weapon/actors/item/Glock17";

import { IProduct, ProductTable } from "./ProductTable";

import { BombPlantPhaseEnum } from "../../declarations/enum/PhaseEnum";

import { FormatCode as FC } from "../../declarations/enum/FormatCode";
import { ItemStackFactory } from "../../infrastructure/utils/ItemStackFactory";

import { ItemLockMode, Player, system, world } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";

export class PurchaseHistory {
    
    private static history = new Map<Player, number[]>();

    static clearAll() {
        this.history.clear();
    }
    
    static get(player: Player) {
        if (!this.history.has(player)) this.history.set(player, new Array(9).fill(-1));
        return this.history.get(player)!;
    }

    static set(player: Player, slot: number, productId?: number) {
        const playerHistory = this.get(player);
        playerHistory[slot] = productId ?? -1;
        this.history.set(player, playerHistory);
    }

    static getProduct(player: Player, slot: number) {
        const playerHistory = this.get(player);
        return ProductTable.find(product => product.id === playerHistory[slot]);
    }

}

export class Shop {

    static async openShop(player: Player) {
        const form = new ActionFormData();
        form.title('SHOP')
            .body(`Select an item to purchase:\nYour Money: ${FC.MinecoinGold}${EconomyManager.getMoney(player)}`)

        for (const product of ProductTable) {
            const canBeRefund = this.checkRefund(player, product);
            const name = (canBeRefund ? `${FC.DarkGreen}(Refund)` : '') + `${FC.Reset}${product.name} ${FC.Yellow}${product.price}$\n${FC.DarkGray}${product.description ?? ''}`;
            form.button(name, product.iconPath);
        }

        this.purchaseResponse(player, await form.show(player));
    }

    private static purchaseResponse(player: Player, response: ActionFormResponse) {
        try 
        {
            if (response.canceled) return;
            if (response.selection === undefined) return;
            const selection = response.selection;
            const product = ProductTable[selection];

            if (this.checkRefund(player, product)) {
                this.refund(player, product);
            } else {
                this.purchase(player, product);
            }
            
            player.playSound('mob.villager.yes');
            this.openShop(player);
        }
        catch (err: any)
        {
            player.sendMessage(`${FC.Gray}>> ${FC.Red}${err.message}.`);
            player.playSound('mob.villager.no');
        }
    }

    private static checkRefund(player: Player, product: IProduct) {
        const playerHistory = PurchaseHistory.get(player);

        const playerHotbar = HotbarManager.getPlayerHotbar(player);
        const hotbarItem = playerHotbar.items.at(product.slot);
        
        return (product.id === playerHistory[product.slot] && product.max_amount === hotbarItem?.amount);
    }

    private static refund(player: Player, product: IProduct) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        const originalHotbarItem = hotbar.items[product.slot]!;
        hotbar.items[product.slot] = undefined;
        
        const refundMoney = product.price * originalHotbarItem.amount;
        EconomyManager.modifyMoney(player, refundMoney);
        
        PurchaseHistory.set(player, product.slot);
        
        // pistol
        if (Math.floor(product.id / 100) == 1) {
            hotbar.items[product.slot] = new Glock17().item;
        }
        HotbarManager.sendHotbar(player, hotbar);

        player.sendMessage(`${FC.Gray}>> ${FC.Yellow}You refund ${product.name}. ${FC.Green}(+${refundMoney}$)`);
    }

    private static purchase(player: Player, product: IProduct) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        const hotbarItem = hotbar.items.at(product.slot);
        
        const historyProduct = PurchaseHistory.getProduct(player, product.slot);
        if (historyProduct && historyProduct.id !== product.id) {
            throw Error(`You should refund your ${historyProduct.name} first.`);
        }

        const productItem = (product.itemActor) ? new product.itemActor().item
                                                : ItemStackFactory.new({ typeId: product.itemStackTypeId!, lockMode: ItemLockMode.slot });
        if (hotbarItem && hotbarItem.typeId === productItem.typeId && hotbarItem.amount >= product.max_amount) {
            throw Error('You have reached purchase limit.');
        }

        if (!EconomyManager.canBeAfforded(player, product.price)) {
            throw Error("You don't have enough money to buy this.")
        }

        EconomyManager.modifyMoney(player, -product.price);
        if (product.id !== 100) {
            PurchaseHistory.set(player, product.slot, product.id);
        }

        this.sendProduct(player, product);

        player.sendMessage(`${FC.Gray}>> ${FC.Yellow}You bought ${product.name}. ${FC.Red}(-${product.price}$)`);
    }

    private static sendProduct(player: Player, product: IProduct) {
        const productItem = (product.itemActor) ? new product.itemActor().item
                                                : ItemStackFactory.new({ typeId: product.itemStackTypeId!, lockMode: ItemLockMode.slot });

        if (productItem.lockMode === ItemLockMode.none) productItem.lockMode = ItemLockMode.slot;
        
        const hotbar = HotbarManager.getPlayerHotbar(player);
        const hotbarItem = hotbar.items[product.slot];

        // 如果走到這裡，物品欄有東西，代表是上一回合留下來的(或是glock17)，直接蓋掉
        if (hotbarItem === undefined || hotbarItem.typeId !== productItem.typeId) {
            hotbar.items[product.slot] = productItem;
        } else if (hotbarItem.typeId === productItem.typeId) {
            hotbarItem.amount ++;
            hotbar.items[product.slot] = hotbarItem;
        }
        
        HotbarManager.sendHotbar(player, hotbar);
    }
}

const openShopListener = world.beforeEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId !== 'minecraft:feather') return;

    const player = ev.source;
    const phase = GamePhaseManager.getPhase();

    if (phase.phaseTag !== BombPlantPhaseEnum.Buying) return;

    system.run(() => {
        Shop.openShop(player);
    });
});