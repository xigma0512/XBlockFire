import { ColorTable, ColorType } from "../../../utils/Color";
import { GameRoomManager } from "./GameRoom";
import { Broadcast } from "../../../utils/Broadcast";

import { Player, world } from "@minecraft/server";

export class MemberManager {
    
    readonly roomId: number;
    private players: Set<Player>;

    constructor(roomId: number) {
        this.players = new Set();
        this.roomId = roomId;
    }

    joinRoom(player: Player) {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        this.players.add(player);
        Broadcast.message(`${ColorTable[ColorType.Green]}${player.name} has joined the game.`, room.memberManager.getPlayers());
    }
    
    leaveRoom(player: Player) {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        this.players.delete(player);
        Broadcast.message(`${ColorTable[ColorType.Red]}${player.name} has left the game.`, room.memberManager.getPlayers());
    }

    getPlayers() {
        return Array.from(this.players);
    }

    includePlayer(player: Player) {
        return this.players.has(player);
    }
    
}

const playerLeaveGameListener = world.beforeEvents.playerLeave.subscribe(ev => {
    const rooms = GameRoomManager.instance.getAllRooms();
    const player = ev.player;
    for (const [serial, room] of rooms) {
        if (room.memberManager.includePlayer(player)) {
            room.memberManager.leaveRoom(player);
            break;
        }
    }
});