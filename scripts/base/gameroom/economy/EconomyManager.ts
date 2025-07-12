import { Player } from "@minecraft/server";

const LIMIT = 9000;

class _EconomyManager {

    private static _instance: _EconomyManager;
    static get instance() { return (this._instance || (this._instance = new this)); }

    private economies: Map<Player, number>;

    constructor() {
        this.economies = new Map();
    }

    initializePlayer(player: Player, startingBalance: number = 800) {
        this.economies.set(player, startingBalance);
    }

    removePlayer(player: Player) {
        this.economies.delete(player);
    }

    modifyMoney(player: Player, value: number) {
        let money = this.getMoney(player);
        this.setMoney(player, (money + value > LIMIT) ? LIMIT : money + value);
    }

    getMoney(player: Player) {
        return this.economies.get(player) ?? 0;
    }

    setMoney(player: Player, value: number) {
        if (value < 0) value = 0;
        this.economies.set(player, value);
    }

    canBeAfforded(player: Player, value: number) {
        return this.getMoney(player) >= value;
    }

}

export const EconomyManager = _EconomyManager.instance; 