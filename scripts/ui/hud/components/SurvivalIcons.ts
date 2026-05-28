import { TeamEnum } from "../../../modules/player/TeamEnum";
import { FormatCode as FC } from "../../../utils/FormatCode";

export class SurvivalIcons {
    /**
     * Generates a string like "O O X" or "X O O"
     * @param total Total players in team
     * @param alive Alive players in team
     * @param teamColor The team's color (FC.Red or FC.Green)
     * @param alignRight If true, pads from left to align right
     * @param maxCount Max players for alignment padding
     */
    static format(total: number, alive: number, teamColor: string, alignRight: boolean, maxCount: number): string {
        let icons = "";
        const dead = total - alive;

        if (alignRight) {
            // Padding from left
            for (let i = 0; i < maxCount - total; i++) icons += "  ";
            for (let i = 0; i < dead; i++) icons += `${FC.Gray}X `;
            for (let i = 0; i < alive; i++) icons += `${teamColor}O `;
        } else {
            // Align Left (default)
            for (let i = 0; i < alive; i++) icons += `${teamColor}O `;
            for (let i = 0; i < dead; i++) icons += `${FC.Gray}X `;
            for (let i = 0; i < maxCount - total; i++) icons += "  ";
        }

        return icons;
    }
}
