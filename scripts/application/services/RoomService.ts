import { gameroom, GameRoomFactory } from "../../domain/gameroom/GameRoom";

import { lang } from "../../infrastructure/Language";

import { GameModeEnum } from "../../declarations/enum/GameModeEnum";
import { MapRegister } from "../../domain/gameroom/MapRegister";

export class RoomService {
    
    static setGamemode(mode: GameModeEnum): ServiceReturnType<number> {
        if (!Object.values<string>(GameModeEnum).includes(mode)) {
            return { ret: 1, message: lang('command.set_gamemode.fail.unknown_gamemode') };
        }
    
        GameRoomFactory.createRoom(mode as GameModeEnum, gameroom().gameMapId);
        return { ret: 0, message: lang('command.set_gamemode.success') }
    }

    static setMap(mapId: number): ServiceReturnType<number> {
        if (!MapRegister.availableMaps.has(mapId)) {
            return { ret: 1, message: lang('command.set_map.fail.unknown_map', mapId) }
        }
        
        const map = MapRegister.getMap(mapId);
        GameRoomFactory.createRoom(gameroom().gameMode, mapId);
        return { ret: 0, message: lang('command.set_map.success', map.name) };
    }
}