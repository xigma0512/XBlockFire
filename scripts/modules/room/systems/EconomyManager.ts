import { Player } from "@minecraft/server";

const LIMIT = 9000;

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
    
    addMoney(player: Player, value: number) {
        const money = this.getMoney(player);
        if (money + value > LIMIT)
        this.setMoney(player, (money + value > LIMIT) ? LIMIT : money + value) 
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