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
        spawns: {
            'Attacker': Position[],
            'Defender': Position[],
            'Spectator': Position[],
        },
        C4_targets: Position[]
    }
}