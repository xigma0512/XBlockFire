import { Entity, Player } from "@minecraft/server";

export interface GameEvent {
    'onPlayerKilled': {
        deadPlayer: Player;
        attacker?: Entity;
    }
}