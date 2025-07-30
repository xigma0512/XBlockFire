export const language = 'ZH-TW';

export const BombPlant = {
    game: {
        auto_start: true,
        auto_start_need_players: 10,
        random_assigned: false,
        winning_score: 7,
    },
    
    economic: {
        round_income: [3500, 2500],
        limit: 9000
    },

    c4: {
        // C4可以被安裝在目標點範圍多少格內
        target_range: 4.5,
        // C4可以在多少格內被拆除
        defuse_range: 1.5
    },

    phaseTime: {
        idle: 30 * 20,
        buying: 20 * 20,
        action: 120 * 20,
        c4planted: 50 * 20,
        roundend: 10 * 20,
        gameover: 10 * 20
    },

    uncommon_items: {
        location: { x: 155, y: 123, z: -2 },
        items: {
            'defender_helmet': 0,
            'defender_chestplate': 1,
            'defender_leggings': 2,
            'defender_boots': 3,

            'attacker_helmet': 4,
            'attacker_chestplate': 5,
            'attacker_leggings': 6,
            'attacker_boots': 7,
        }
    }

}