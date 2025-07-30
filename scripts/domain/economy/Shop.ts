import { ShopService } from "../../application/services/ShopService";

import { EconomyManager } from "../economy/EconomyManager";
import { HotbarManager } from "../player/HotbarManager";
import { PurchaseHistory } from "./PurchaseHistory";
import { Glock17 } from "../weapon/actors/item/Glock17";

import { IProduct, ProductTable } from "../../interface/ui/shop/ProductTable";

import { ItemStackFactory } from "../../infrastructure/utils/ItemStackFactory";
import { lang } from "../../infrastructure/Language";

import { ItemLockMode, Player, system, world } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";

export class Shop {

    static purchaseResponse(player: Player, response: ActionFormResponse) {
        try 
        {
            if (response.canceled) return false;
            if (response.selection === undefined) return false;
            const selection = response.selection;
            const product = ProductTable[selection];

            if (this.checkRefund(player, product)) {
                this.refund(player, product);
            } else {
                this.purchase(player, product);
            }
            
            player.playSound('mob.villager.yes');
            return true;
        }
        catch (err: any)
        {
            player.sendMessage(err.message);
            player.playSound('mob.villager.no');
            return false;
        }
    }

    static checkRefund(player: Player, product: IProduct) {
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

        player.sendMessage(lang('game.shop.refund.success', product.name, refundMoney));
    }

    private static purchase(player: Player, product: IProduct) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        const hotbarItem = hotbar.items.at(product.slot);
        
        const historyProduct = PurchaseHistory.getProduct(player, product.slot);
        if (historyProduct && historyProduct.id !== product.id) {
            throw Error(lang('game.shop.purchase.fail.should_refund_first', historyProduct.name));
        }

        const productItem = (product.itemActor) ? new product.itemActor().item
                                                : ItemStackFactory.new({ typeId: product.itemStackTypeId!, lockMode: ItemLockMode.slot });
        if (hotbarItem && hotbarItem.typeId === productItem.typeId && hotbarItem.amount >= product.max_amount) {
            throw Error(lang('game.shop.purchase.fail.reached_purchase_limit'));
        }

        if (!EconomyManager.canBeAfforded(player, product.price)) {
            throw Error(lang('game.shop.purchase.fail.cannot_afford'));
        }

        EconomyManager.modifyMoney(player, -product.price);
        if (product.id !== 100) {
            PurchaseHistory.set(player, product.slot, product.id);
        }

        this.sendProduct(player, product);

        player.sendMessage(lang('game.shop.purchase.success', product.name, product.price));
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

world.beforeEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId === 'minecraft:feather') {
        system.run(() => ShopService.openShop(ev.source));
    }
});