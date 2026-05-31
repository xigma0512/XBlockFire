import { FormatCode as FC } from '../../../utils/FormatCode';
import { Language as L } from '../../../utils/Language';

export class RoomInfo {
    /**
     * Returns an array of strings representing map and mode
     */
    static format(mapName: string, gameMode: string): string[] {
        return [L.translate('hud.sidebar.map', mapName), `${L.translate('hud.sidebar.mode')} ${FC.Yellow}${gameMode}`];
    }
}
