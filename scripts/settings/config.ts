export namespace Config {
    export const bombplant = {
        idle: {
            AUTO_START: true,
            AUTO_START_MIN_PLAYER: 10,
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
            INCOME: [3000, 1500],
            WINNING_SCORE: 7,
            COUNTDOWN_TIME: 5 * 20
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
        C4_TARGET_RANGE: 4.5
    }
}