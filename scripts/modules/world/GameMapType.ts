export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface GameMapType {
    id: number;
    name: string;
    description: string;
    positions: {
        spawns: {
            Attacker: Position[];
            Defender: Position[];
            Spectator: Position[];
        };
        dm_spawns: {
            Attacker: Position[];
            Defender: Position[];
        };
    };
}

