export default {
    0: {
        id: 0,
        name: 'Melon Map',
        description: 'A Good Map',
        positions: {
            attacker_spawns: [
                { x: 208, y: 93, z: 480 },
                { x: 208, y: 93, z: 478 },
                { x: 208, y: 93, z: 476 },
                { x: 206, y: 93, z: 479 },
                { x: 206, y: 93, z: 477 }
            ],
            defender_spawns: [
                { x: 256, y: 93, z: 436 },
                { x: 256, y: 93, z: 438 },
                { x: 256, y: 93, z: 440 },
                { x: 258, y: 93, z: 437 },
                { x: 258, y: 93, z: 439 }
            ],
            bomb_targets: [
                { x: 216, y: 93, z: 433 },
                { x: 253, y: 93, z: 478 }
            ]
        }
    }
} as Record<number, GameMapType>;