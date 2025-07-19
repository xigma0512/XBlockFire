import { Player } from "@minecraft/server";
import { economy } from "../../settings/config";

const LIMIT = economy.LIMIT;

export class EconomyManager {

    private static economies = new Map<Player, number>();

    static initializePlayer(player: Player, startingBalance: number = 800) {
        this.economies.set(player, startingBalance);
    }

    static removePlayer(player: Player) {
        this.economies.delete(player);
    }

    static modifyMoney(player: Player, value: number) {
        let money = this.getMoney(player);
        this.setMoney(player, (money + value > LIMIT) ? LIMIT : money + value);
    }

    static getMoney(player: Player) {
        return this.economies.get(player) ?? 0;
    }

    static setMoney(player: Player, value: number) {
        if (value < 0) value = 0;
        this.economies.set(player, value);
    }

    static canBeAfforded(player: Player, value: number) {
        return this.getMoney(player) >= value;
    }

}