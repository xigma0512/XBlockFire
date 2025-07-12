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

class _MemberManager {
    
    private static _instance: _MemberManager;
    static get instance() { return (this._instance || (this._instance = new this)); }

    private players: Set<Player>;

    private constructor() { 
        this.players = new Set();
    }

    joinRoom(player: Player) {
        this.players.add(player);
        Broadcast.message(`${FC.Bold}${FC.Green}${player.name} has joined the room.`, this.getPlayers());
    }
    
    leaveRoom(player: Player) {
        this.players.delete(player);
        Broadcast.message(`${FC.Bold}${FC.Red}${player.name} has left the room.`, this.getPlayers());
    }

    getPlayers(filter?: MemberFilter) {        
        const allPlayers = Array.from(this.players.keys());
        
        if (!filter) return allPlayers;

        return allPlayers.filter(p => {
            if (filter.team && filter.team !== entity_dynamic_property(p, 'player:team')) return false;
            if (filter.is_alive && filter.is_alive !== entity_dynamic_property(p, 'player:is_alive')) return false;
            return true;
        });
    }

    includePlayer(player: Player) {
        return this.players.has(player);
    }
    
}

export const MemberManager = _MemberManager.instance;

const playerLeaveGameListener = world.beforeEvents.playerLeave.subscribe(ev => {
    MemberManager.leaveRoom(ev.player);
});