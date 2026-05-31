import { FormatCode as FC } from '../../../utils/FormatCode';

export class MatchScore {
    /**
     * Generates a string like "<Score> || <Time> || <Score>"
     */
    static format(leftScore: number, timeStr: string, rightScore: number): string {
        return `${FC.MaterialEmerald}${leftScore} ${FC.Gray}|| ${FC.White}${timeStr} ${FC.Gray}|| ${FC.MaterialRedstone}${rightScore}`;
    }
}
