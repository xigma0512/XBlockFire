import { Player } from "@minecraft/server";

export class EconomyManager {

    readonly roomId: string;
    private economies: Map<Player, number>;

    constructor(roomId: string) {
        this.economies = new Map();
        this.roomId = roomId;
    }

    initializePlayer(player: Player, startingBalance: number = 800) {
        this.economies.set(player, startingBalance);
    }

    removePlayer(player: Player) {
        this.economies.delete(player);
    }
    

    getMoney(player: Player) {
        return this.economies.get(player) ?? 0;
    }

    setMoney(player: Player, value: number) {
        if (value < 0) value = 0;
        this.economies.set(player, value);
    }

    payMoney(sender: Player, receiver: Player, value: number) {
        const senderMoney = this.getMoney(sender);
        const receiverMoney = this.getMoney(receiver);
        if (senderMoney - value < 0) return false;
        this.setMoney(sender, senderMoney - value);
        this.setMoney(receiver, receiverMoney + value);
        return true;
    }

}