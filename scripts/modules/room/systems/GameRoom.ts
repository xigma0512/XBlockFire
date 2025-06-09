import { PhaseManager } from "./PhaseManager";
import { EconomyManager } from "./EconomyManager";
import { MemberManager } from "./MemberManager";

import { GameModeEnum } from "../types/Enum";
import { randomUUID } from "../../../utils/Utils";

class GameRoom {
    
    readonly id: string;
    readonly gameMode: GameModeEnum;
    readonly gameMapId: number;

    readonly memberManager: MemberManager;
    readonly phaseManager: PhaseManager;
    readonly economyManager: EconomyManager;

    constructor(id: string, gameMode: GameModeEnum, gameMapId: number) {
        this.id = id;
        this.gameMode = gameMode;
        this.gameMapId = gameMapId;

        this.memberManager = new MemberManager(id);
        this.phaseManager = new PhaseManager(id);
        this.economyManager = new EconomyManager(id);
    }

}

export class GameRoomManager {
    
    private static _instance: GameRoomManager;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private readonly rooms: Map<string, GameRoom>;

    constructor() {
        this.rooms = new Map();
    }

    createRoom(gameMode: GameModeEnum, mapId: number) {
        const roomId = randomUUID();
        const roomCreated = new GameRoom(roomId, gameMode, mapId);
        
        this.rooms.set(roomId, roomCreated);
        return roomId;
    }

    getRoom(id: string) {
        return this.rooms.get(id);
    }

    removeRoom(id: string) {
        return this.rooms.delete(id);
    }

    getAllRooms() {
        return Array.from(this.rooms.entries());
    }
}