import { PhaseManager } from "./PhaseManager";
import { EconomyManager } from "./EconomyManager";
import { MemberManager } from "./MemberManager";

import { GameModeEnum } from "../types/Enum";

class GameRoom {
    
    readonly id: number;
    readonly gameMode: GameModeEnum;
    readonly gameMapId: number;

    readonly memberManager: MemberManager;
    readonly phaseManager: PhaseManager;
    readonly economyManager: EconomyManager;

    constructor(id: number, gameMode: GameModeEnum, gameMapId: number) {
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

    private serialId: number = 0;
    private readonly rooms: Map<number, GameRoom>;

    constructor() {
        this.rooms = new Map();
    }

    createRoom(gameMode: GameModeEnum, mapId: number) {
        const roomCreated = new GameRoom(this.serialId, gameMode, mapId);
        
        this.rooms.set(this.serialId, roomCreated);
        return this.serialId++;
    }

    getRoom(roomId: number) {
        if (this.rooms.has(roomId)) {
            return this.rooms.get(roomId) as GameRoom;
        }
        throw Error(`Cannot found room ${roomId}`);
    }

    removeRoom(roomId: number) {
        return this.rooms.delete(roomId);
    }

    getAllRooms() {
        return Array.from(this.rooms.entries());
    }
}