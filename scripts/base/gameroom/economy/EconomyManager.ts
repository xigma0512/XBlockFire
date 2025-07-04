import { Player } from "@minecraft/server";

const LIMIT = 9000;

export class EconomyManager {

    readonly roomId: number;
    private economies: Map<Player, number>;

    constructor(roomId: number) {
        this.economies = new Map();
        this.roomId = roomId;
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