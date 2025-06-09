type TeamTagEnum = number;

interface Position {
    x: number;
    y: number;
    z: number;
}

type PositionType = |
    'attacker_spawns' |
    'defender_spawns' |
    'bomb_targets'

declare interface GameMap {
    id: number;
    name: string;
    description: string;
    positions: Record<PositionType, Position | Position[]>;
}