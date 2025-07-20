export default {
    0: {
        id: 0,
        name: 'Melon Map',
        description: 'A Good Map',
        positions: {
            attacker_spawns: [
                { x: 130.5, y: 86, z: 28.5 },
                { x: 130.5, y: 86, z: 26.5 },
                { x: 130.5, y: 86, z: 24.5 },
                { x: 128.5, y: 86, z: 27.5 },
                { x: 128.5, y: 86, z: 25.5 }
            ],
            defender_spawns: [
                { x: 178.5, y: 86, z: -15.5 },
                { x: 178.5, y: 86, z: -13.5 },
                { x: 178.5, y: 86, z: -11.5 },
                { x: 180.5, y: 86, z: -14.5 },
                { x: 180.5, y: 86, z: -12.5 }
            ],
            C4_targets: [
                { x: 150.5, y: 86, z: -11.5 },
                { x: 175.5, y: 86, z: 11.5 }
            ]
        }
    },
    1: {
        id: 1,
        name: 'CS:GO DUST II',
        description: '',
        positions: {
            attacker_spawns: [
                { x: 1.5, y: 81, z: -5.5 },
                { x: -0.5, y: 93, z: 478 },
                { x: -2.5, y: 93, z: 476 },
                { x: -4.5, y: 93, z: 479 },
                { x: -6.5, y: 93, z: 477 }
            ],
            defender_spawns: [
                { x: -34.5, y: 75, z: 84.5 },
                { x: -32.5, y: 75, z: 84.5 },
                { x: -30.5, y: 75, z: 84.5 },
                { x: -33.5, y: 75, z: 86.5 },
                { x: -31.5, y: 75, z: 84.5 },
            ],
            C4_targets: [
                { x: -54.5, y: 81, z: 85.5 },
                { x: 22.5, y: 78, z: 89.5 }
            ]
        }
    }
} as Record<number, GameMapType>;