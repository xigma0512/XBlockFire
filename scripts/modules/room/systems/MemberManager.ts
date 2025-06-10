import { ColorTable, ColorType } from "../../../utils/Color";

import { ChatSendBeforeEvent, Player, PlayerLeaveBeforeEvent, world } from "@minecraft/server";

export class MemberManager {
    
    readonly roomId: number;
    private players: Set<Player>;

    constructor(roomId: number) {
        this.players = new Set();
        this.roomId = roomId;
    }

    joinRoom(player: Player) {
        if (this.players.has(player)) return false;

        this.players.add(player);
        world.sendMessage(`${ColorTable[ColorType.Green]}${player.name} has joined the game.`);

        return true;
    }

    leaveRoom(player: Player) {
        if (!this.players.has(player)) return false;

        this.players.delete(player);
        world.sendMessage(`${ColorTable[ColorType.Red]}${player.name} has left the game.`);

        return true;
    }

    getPlayers() {
        return Array.from(this.players);
    }

    includePlayer(player: Player) {
        return this.players.has(player);
    }
    
}