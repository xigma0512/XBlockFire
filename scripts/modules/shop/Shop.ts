import { EconomyManager } from "../../base/gameroom/economy/EconomyManager";
import { PhaseManager } from "../../base/gamephase/PhaseManager";
import { MemberManager } from "../../base/gameroom/member/MemberManager";
import { HotbarManager } from "../hotbar/Hotbar";

import { ItemActor } from "../../base/weapon/actors/Actor";
import { AK47 } from "../../base/weapon/actors/item/AK47";
import { M4A4 } from "../../base/weapon/actors/item/M4A4";
import { Glock17 } from "../../base/weapon/actors/item/Glock17";
import { Deagle } from "../../base/weapon/actors/item/Deagle";

import { PhaseEnum as BombPlantPhaseEnum } from "../../types/gamephase/BombPlantPhaseEnum";

import { FormatCode as FC } from "../../utils/FormatCode";
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
        price: 2900,
        max_amount: 1,
        hotbar_slot: 0,
        itemActor: AK47,
        description: "GOOD GUN",
        iconPath: 'textures/items/gun/ak47'
    },
    {
        name: "M4A4",
        price: 2900,
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
        name: "Deagle",
        price: 600,
        max_amount: 1,
        hotbar_slot: 1,
        itemActor: Deagle,
        description: "This is a good and classic weapon.",
        iconPath: 'textures/items/gun/glock17'
    },
    {
        name: "SmokeGrenade",
        price: 200,
        max_amount: 2,
        hotbar_slot: 4,
        itemStackTypeId: 'xblockfire:smoke_grenade_item',
        iconPath: 'textures/items/grenade/smoke_grenade_item'
    },
    {
        name: "Flashbang",
        price: 350,
        max_amount: 2,
        hotbar_slot: 5,
        itemStackTypeId: 'xblockfire:flashbang_item',
        iconPath: 'textures/items/grenade/flashbang_item'
    }
];

class _Shop {

    private static _instance: _Shop;
    static get instance() { return (this._instance || (this._instance = new this)); }

    async openShop(player: Player) {
        const form = new ActionFormData();
        form.title('SHOP')
            .body('Select an item to purchase:')

        for (const product of productTable) {
            const name = `${FC.White}${product.name} | ${FC.Yellow}${product.price}$\n${FC.Gray}${product.description ?? ''}`;
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
        if (EconomyManager.canBeAfforded(player, price)) {
            EconomyManager.modifyMoney(player, -price);
        } else {
            throw Error("You don't have enough money to buy this.")
        }
    }
}

export const Shop = _Shop.instance;

const openShopListener = world.beforeEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId !== 'minecraft:feather') return;

    const player = ev.source;
    if (!MemberManager.includePlayer(player)) return;

    const phase = PhaseManager.getPhase();

    if (phase.phaseTag !== BombPlantPhaseEnum.Buying) return;

    system.run(() => {
        Shop.openShop(player);
    });
});