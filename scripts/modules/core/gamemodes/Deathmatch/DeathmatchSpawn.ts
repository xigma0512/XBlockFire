import { gameroom } from '../../GameRoom';
import { TeamEnum } from '../../../player/TeamEnum';
import { MapRegister } from '../../../world/MapRegister';
import { Position } from '../../../world/GameMapType';

export class DeathmatchSpawn {
    static randomSpawn(team: TeamEnum.Attacker | TeamEnum.Defender): Position {
        const map = MapRegister.getMap(gameroom().gameMapId);
        const spawns = map.positions.dm_spawns?.[team] ?? map.positions.spawns[team];
        return spawns[Math.floor(Math.random() * spawns.length)];
    }
}

