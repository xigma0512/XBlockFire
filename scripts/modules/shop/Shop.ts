import { GameRoomManager } from "../../base/gameroom/GameRoom";
import { MemberManager } from "../../base/gameroom/member/MemberManager";
import { ItemActor } from "../weapon/actors/Actor";
import { Glock17 } from "../weapon/actors/item/Glock17";

import { PhaseEnum as BombPlantPhaseEnum } from "../../types/gamephase/BombPlantPhaseEnum";

import { ItemLockMode, ItemStack, Player, system, world } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { HotbarManager } from "../hotbar/Hotbar";

interface Product {
    name: string;
    price: number;
    max_amount: number;
    hotbar_slot: number;
    
    itemActor?: (new () => ItemActor);
    itemStackTypeId?: string;

    iconPath?: string;
    description?: string;
}

const productTable: Product[] = [
    {
        name: "Glock17",
        price: 0,
        max_amount: 1,
        hotbar_slot: 1,
        itemActor: Glock17,
        description: "This is a good and classic weapon."
    },
    {
        name: "Flashbang",
        price: 300,
        max_amount: 2,
        hotbar_slot: 5,
        itemStackTypeId: 'xblockfire:flashbang_item',
    }
];

export class Shop {

    private static _instance: Shop;
    static get instance() { return (this._instance || (this._instance = new this)); }

    async openShop(player: Player) {
        const form = new ActionFormData();
        form.title('SHOP')
            .body('Select an item to purchase:')

        for (const product of productTable) {
            const name = `${product.name}\n${product.description ?? ''}`;
            form.button(name, product.iconPath);
        }

        this.purchaseResponse(player, await form.show(player));
    }

    private purchaseResponse(player: Player, response: ActionFormResponse) {
        try 
        {
            if (response.selection === undefined) return;
            const selection = response.selection;
            const product = productTable[selection];
            
            this.pay(player, product.price);
            
            const productItem = (product.itemActor) ? new product.itemActor().item
                                                    : new ItemStack(product.itemStackTypeId!);

            if (productItem.lockMode === ItemLockMode.none) productItem.lockMode = ItemLockMode.slot;
            
            const hotbar = HotbarManager.getPlayerHotbar(player);
            const hotbarItem = hotbar.items[product.hotbar_slot];

            if (hotbarItem === undefined) {
                hotbar.items[product.hotbar_slot] = productItem;
            } else if (hotbarItem.typeId === productItem.typeId) {
                hotbarItem.amount ++;
                hotbar.items[product.hotbar_slot] = hotbarItem;
            }
            
            HotbarManager.sendHotbar(player, hotbar);
        }
        catch (err: any)
        {
            player.sendMessage(err.message);
        }
    }

    private pay(player: Player, price: number) {
        const playerRoomId = MemberManager.getPlayerRoomId(player)!;
        const playerRoom = GameRoomManager.instance.getRoom(playerRoomId);
        const economy = playerRoom.economyManager;

        if (economy.canBeAfforded(player, price)) {
            economy.modifyMoney(player, -price);
        } else {
            throw Error("You don't have enough money to buy this.")
        }
    }
}

const openShopListener = world.beforeEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId !== 'minecraft:feather') return;

    const player = ev.source;
    if (!MemberManager.isInRoom(player)) return;

    const playerRoomId = MemberManager.getPlayerRoomId(player)!;
    const playerRoom = GameRoomManager.instance.getRoom(playerRoomId);
    const phase = playerRoom.phaseManager.getPhase();

    if (phase.phaseTag !== BombPlantPhaseEnum.Buying) return;

    system.run(() => {
        Shop.instance.openShop(player);
    });
});