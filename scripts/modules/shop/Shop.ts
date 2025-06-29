import { GameRoomManager } from "../../base/gameroom/GameRoom";
import { MemberManager } from "../../base/gameroom/member/MemberManager";
import { HotbarManager } from "../hotbar/Hotbar";
import { ItemActor } from "../weapon/actors/Actor";
import { Glock17 } from "../weapon/actors/item/Glock17";

import { PhaseEnum as BombPlantPhaseEnum } from "../../types/gamephase/BombPlantPhaseEnum";

import { ItemLockMode, ItemStack, Player, world } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";

interface Product {
    name: string;
    price: number;
    hotbar_slot: number;
    item: (new () => ItemActor) | ItemStack;
    max_amount: number;
    iconPath?: string;
    description?: string;
}

export class Shop {

    private static _instance: Shop;
    static get instance() { return (this._instance || (this._instance = new this)); }

    readonly productTable: Product[] = [
        {
            name: "Glock17",
            price: 0,
            item: Glock17,
            max_amount: 1,
            hotbar_slot: 1,
            description: "This is a good and classic weapon."
        },
        {
            name: "Flashbang",
            price: 300,
            item: new ItemStack('xblockfire:flashbang_item', 1),
            max_amount: 2,
            hotbar_slot: 5
        }
    ];

    async openShop(player: Player) {
        const form = new ActionFormData();
        form.title('SHOP')
            .body('Select an item to purchase:')

        for (const product of this.productTable) {
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
            const product = this.productTable[selection];

            this.pay(player, product.price);
            
            let item: ItemStack;
            if (product.item instanceof ItemStack) {
                item = product.item;
                item.lockMode = ItemLockMode.slot;
            } else {
                item = new product.item().item;
            }
            
            const hotbar = HotbarManager.instance.getHotbar(player);
            const hotbarItem = hotbar.get(product.hotbar_slot);
            if (hotbarItem === undefined || !hotbarItem.matches(item.typeId)) {
                hotbar.set(product.hotbar_slot, item);
            }
            else {
                hotbarItem.amount += item.amount;
                hotbar.set(product.hotbar_slot, hotbarItem);
            }
            
            HotbarManager.instance.sendHotbar(player);
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

    Shop.instance.openShop(player);
});