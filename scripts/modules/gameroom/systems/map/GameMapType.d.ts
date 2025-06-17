interface Position {
    x: number;
    y: number;
    z: number;
}

declare interface GameMapType {
    id: number;
    name: string;
    description: string;
    positions: {
        attacker_spawns: Position[],
        defender_spawns: Position[],
        bomb_targets: Position[]
    }
}