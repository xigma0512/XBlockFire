import { TeamEnum } from "../../../types/TeamEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { Broadcast } from "../../../utils/Broadcast"; 
import { entity_dynamic_property } from "../../../utils/Property";

import { Player, world } from "@minecraft/server";

interface MemberFilter {
    group?: number;
    team?: TeamEnum;
    is_alive?: boolean;
}

export class MemberManager {

    private static players = new Set<Player>();

    static joinRoom(player: Player) {
        this.players.add(player);
        Broadcast.message(`${FC.Bold}${FC.Green}${player.name} join the room.`, this.getPlayers());
    }
    
    static leaveRoom(player: Player) {
        this.players.delete(player);
        Broadcast.message(`${FC.Bold}${FC.Red}${player.name} leave the room.`, this.getPlayers());
    }

    static getPlayers(filter?: MemberFilter) {        
        const allPlayers = Array.from(this.players.keys());
        
        if (!filter) return allPlayers;

        return allPlayers.filter(p => {
            if (filter.team !== undefined && filter.team !== entity_dynamic_property(p, 'player:team')) return false;
            if (filter.is_alive !== undefined && filter.is_alive !== entity_dynamic_property(p, 'player:is_alive')) return false;
            return true;
        });
    }

    static includePlayer(player: Player) {
        return this.players.has(player);
    }
    
}

const playerLeaveGameListener = world.beforeEvents.playerLeave.subscribe(ev => {
    MemberManager.leaveRoom(ev.player);
});