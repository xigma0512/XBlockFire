import { TeamEnum } from "../../declarations/enum/TeamEnum";
import { entity_dynamic_property } from "../../infrastructure/data/Property";

import { Player, world } from "@minecraft/server";

interface MemberFilter {
    group?: number;
    team?: TeamEnum;
    is_alive?: boolean;
}

export class MemberManager {

    private static players = new Set<Player>();
    private static playerTeam = new Map<Player, TeamEnum>();

    static joinRoom(player: Player) {
        this.players.add(player);
        this.playerTeam.set(player, TeamEnum.Spectator);
    }
    
    static leaveRoom(player: Player) {
        this.players.delete(player);
        this.playerTeam.delete(player);
    }

    static getPlayers(filter?: MemberFilter) {        
        const allPlayers = Array.from(this.players.keys());
        
        if (!filter) return allPlayers;

        return allPlayers.filter(p => {
            if (filter.team !== undefined && this.getPlayerTeam(p) !== filter.team) return false;
            if (filter.is_alive !== undefined && filter.is_alive !== entity_dynamic_property(p, 'player:is_alive')) return false;
            return true;
        });
    }

    static setPlayerTeam(player: Player, team: TeamEnum) {
        this.playerTeam.set(player, team);
    }

    static getPlayerTeam(player: Player) {
        if (!this.playerTeam.has(player)) {
            this.playerTeam.set(player, TeamEnum.Spectator);
        }
        return this.playerTeam.get(player)!;
    }
    
}

world.afterEvents.worldLoad.subscribe(() => {
    for (const player of world.getAllPlayers()) {
        MemberManager.joinRoom(player);
    }
});

world.afterEvents.playerSpawn.subscribe(ev => {
    if (ev.initialSpawn) {
        MemberManager.joinRoom(ev.player);
    }
});

world.beforeEvents.playerLeave.subscribe(ev => {
    MemberManager.leaveRoom(ev.player);
});