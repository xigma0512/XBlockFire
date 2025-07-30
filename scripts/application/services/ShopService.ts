import { Player } from "@minecraft/server";

import { Shop } from "../../domain/economy/Shop";

import { getShopUI } from "../../interface/ui/shop/ShopUI";

export class ShopService {
    static async openShop(player: Player) {
        const ui = getShopUI(player);
        if (Shop.purchaseResponse(player, await ui.show(player))) {
            this.openShop(player);
        }
    }
}