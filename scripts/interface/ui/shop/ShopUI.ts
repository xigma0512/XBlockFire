import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

import { EconomyManager } from "../../../domain/economy/EconomyManager";
import { Shop } from "../../../domain/economy/Shop";

import { ProductTable } from "./ProductTable";

import { lang } from "../../../infrastructure/Language";

export function getShopUI(player: Player) {
    const form = new ActionFormData();
    form.title(lang('ui.shop.title'))
        .body(lang('ui.shop.body', EconomyManager.getMoney(player)));
    
    for (const product of ProductTable) {
        const canBeRefund = Shop.checkRefund(player, product);
        const name = (canBeRefund ? lang('ui.shop.refund_text') : '') 
                    + lang('ui.shop.product_info', product.name, product.price, product.description ?? '');
        form.button(name, product.iconPath);
    }

    return form;
}