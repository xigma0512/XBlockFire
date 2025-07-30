import { Player } from "@minecraft/server";
import { ProductTable } from "../../interface/ui/shop/ProductTable";

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