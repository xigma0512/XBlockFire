import { Entity, Player } from "@minecraft/server";

export interface GameEvent {
    'playerDied': {
        deadPlayer: Player;
        attacker?: Entity;
    }
}