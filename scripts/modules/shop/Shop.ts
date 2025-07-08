import { GameRoomManager } from "../../base/gameroom/GameRoom";
import { MemberManager } from "../../base/gameroom/member/MemberManager";
import { HotbarManager } from "../hotbar/Hotbar";

import { ItemActor } from "../weapon/actors/Actor";
import { Glock17 } from "../weapon/actors/item/Glock17";
import { AK47 } from "../weapon/actors/item/AK47";
import { M4A4 } from "../weapon/actors/item/M4A4";

import { PhaseEnum as BombPlantPhaseEnum } from "../../types/gamephase/BombPlantPhaseEnum";
import { ItemStackFactory } from "../../utils/ItemStackFactory";

import { ItemLockMode, Player, system, world } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";

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
        name: "AK47",
        price: 0,
        max_amount: 1,
        hotbar_slot: 0,
        itemActor: AK47,
        description: "GOOD GUN",
        iconPath: 'textures/items/gun/ak47'
    },
    {
        name: "M4A4",
        price: 0,
        max_amount: 1,
        hotbar_slot: 0,
        itemActor: M4A4,
        description: "GOOD GUN",
        iconPath: 'textures/items/gun/m4a4'
    },
    {
        name: "Glock17",
        price: 0,
        max_amount: 1,
        hotbar_slot: 1,
        itemActor: Glock17,
        description: "This is a good and classic weapon.",
        iconPath: 'textures/items/gun/glock17'
    },
    {
        name: "SmokeGrenade",
        price: 300,
        max_amount: 2,
        hotbar_slot: 4,
        itemStackTypeId: 'xblockfire:smoke_grenade_item',
        iconPath: 'textures/items/grenade/smoke_grenade_item'
    },
    {
        name: "Flashbang",
        price: 300,
        max_amount: 2,
        hotbar_slot: 5,
        itemStackTypeId: 'xblockfire:flashbang_item',
        iconPath: 'textures/items/grenade/flashbang_item'
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
            const name = `${product.name} | ${product.price}$\n${product.description ?? ''}`;
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
            
            this.checkAmountLimit(player, product.hotbar_slot, product.max_amount);
            this.pay(player, product.price);
            
            const productItem = (product.itemActor) ? new product.itemActor().item
                                                    : ItemStackFactory.new({ typeId: product.itemStackTypeId!, lockMode: ItemLockMode.slot });

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

    private checkAmountLimit(player: Player, slot: number, limit: number) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        const hotbarItem = hotbar.items.at(slot);
        if (hotbarItem !== undefined && hotbarItem.amount >= limit) {
            throw Error('You have reached purchase limit.');
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