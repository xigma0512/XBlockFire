import { Performance } from '../../../utils/others/Performance';
import { FormatCode as FC } from '../../../utils/FormatCode';
import { Config } from '../../../settings/config';

export class DebugInfo {
    /**
     * Returns formatted performance metrics lines if DEBUG is enabled
     */
    static format(): string[] {
        if (!Config.game.DEBUG) return [];

        const tps = Performance.tps.toFixed(1);
        const mspt = Performance.mspt.toFixed(1);

        return [
            '', // Spacer
            `${FC.Gray}TPS: ${FC.Green}${tps} ${FC.Gray}MSPT: ${FC.Yellow}${mspt}`,
        ];
    }
}
