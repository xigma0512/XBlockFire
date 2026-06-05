const POINT_LIMITS = [6, 8, 10, 12, 14, 16, 16] as const;

export class EquipmentPointManager {
    static getPointLimitForRound(round: number) {
        const safeRound = Math.max(1, Math.floor(round));
        return POINT_LIMITS[Math.min(safeRound, POINT_LIMITS.length) - 1];
    }

    static getPointLimit(attackerScore: number, defenderScore: number) {
        return this.getPointLimitForRound((attackerScore + defenderScore) % POINT_LIMITS.length);
    }
}
