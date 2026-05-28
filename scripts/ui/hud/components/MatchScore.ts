import { FormatCode as FC } from "../../../utils/FormatCode";

export class MatchScore {
    /**
     * Generates a string like "<Score> || <Time> || <Score>"
     */
    static format(leftScore: number, leftColor: string, timeStr: string, rightScore: number, rightColor: string): string {
        return `${leftColor}${leftScore} ${FC.Gray}|| ${FC.White}${timeStr} ${FC.Gray}|| ${rightColor}${rightScore}`;
    }
}
