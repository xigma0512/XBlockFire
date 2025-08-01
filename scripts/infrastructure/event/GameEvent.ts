import { Entity, Player, Vector3 } from "@minecraft/server";

export interface GameEvent {
    
    'onPlayerKilled': {
        deadPlayer: Player;
        attacker?: Entity;
    };

    'onC4Planted': {
        source: Player;
        site: number; 
    };

    'onC4Defused': {
        source: Player;
    };

    'onC4Dropped': {
        source: Player;
        location: Vector3;
    };

    'onC4PickedUp': {
        source: Player;
    };

}