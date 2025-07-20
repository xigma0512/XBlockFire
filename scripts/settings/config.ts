export namespace Config {
    export const game = {
        AUTO_START: true,
        AUTO_START_MIN_PLAYER: 10,
        RANDOM_ASSIGNED: false
    }

    export const bombplant = {
        idle: {
            COUNTDOWN_TIME: 30 * 20
        },
        buying: {
            COUNTDOWN_TIME: 20 * 20
        },
        action: {
            ACTION_TIME: 120 * 20
        },
        C4planted: {
            COUNTDOWN_TIME: 50 * 20
        },
        roundEnd: {
            INCOME: [3500, 2200],
            WINNING_SCORE: 13,
            COUNTDOWN_TIME: 10 * 20
        },
        gameover: {
            COUNTDOWN_TIME: 10 * 20
        }
    }
    
    export const economy = {
        LIMIT: 9000
    }

    export const c4 = {
        // C4可以被安裝在目標點範圍多少格內
        C4_TARGET_RANGE: 4.5,
        // C4可以在多少格內被拆除
        DEFUSE_RANGE: 1.5
    }

    export const uncommon_items = {
        CONTAINER_LOCATION: { x: 155, y: 123, z: -2 },
        ITEM_LIST: {
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