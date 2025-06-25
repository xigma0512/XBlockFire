import { GameRoomManager } from "../GameRoom";

import { TeamEnum } from "../../types/TeamEnum";
import { FormatCode as FC } from "../../../../utils/FormatCode";
import { Broadcast } from "../../../../utils/Broadcast";
import { entity_dynamic_property } from "../../../../utils/Property";

import { Player, world } from "@minecraft/server";

interface MemberFilter {
    group?: number;
    team?: TeamEnum;
    is_alive?: boolean;
}

export class MemberManager {
    
    readonly roomId: number;
    private static players = new Map<Player, number>();

    constructor(roomId: number) {
        this.roomId = roomId;
    }

    joinRoom(player: Player) {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        MemberManager.players.set(player, this.roomId);
        Broadcast.message(`${FC.Green}${player.name} has joined the game.`, room.memberManager.getPlayers());
    }
    
    leaveRoom(player: Player) {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        MemberManager.players.delete(player);
        Broadcast.message(`${FC.Red}${player.name} has left the game.`, room.memberManager.getPlayers());
    }

    getPlayers(filter?: MemberFilter) {
        const result = Array.from(MemberManager.players.keys());
        
        if (!filter) return result;
        
        return result.filter(p => {
            if (filter.group && filter.group !== entity_dynamic_property(p, 'player:group')) return false;
            if (filter.team && filter.team !== entity_dynamic_property(p, 'player:team')) return false;
            if (filter.is_alive && filter.is_alive !== entity_dynamic_property(p, 'player:is_alive')) return false;
            return true;
        });
    }

    includePlayer(player: Player) {
        return MemberManager.players.get(player) === this.roomId;
    }

    static isInRoom(player: Player) {
        return MemberManager.players.has(player);
    }

    static getPlayerRoomId(player: Player) {
        return this.players.get(player);
    }
    
}

const playerLeaveGameListener = world.beforeEvents.playerLeave.subscribe(ev => {
    if (!MemberManager.isInRoom(ev.player)) return;
    const roomId = MemberManager.getPlayerRoomId(ev.player)!;
    const room = GameRoomManager.instance.getRoom(roomId);
    room.memberManager.leaveRoom(ev.player);
});