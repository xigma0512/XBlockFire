import { PhaseManager } from "./phase/PhaseManager";
import { EconomyManager } from "./economy/EconomyManager";
import { MemberManager } from "./member/MemberManager";
import { BombManager } from "./bomb/BombManager";
import { AlliesMarker } from "../../allies_mark/AlliesMarker";

import { GameModeEnum } from "./GameModeEnum";

import { system } from "@minecraft/server";
import { TeamTagEnum } from "../../weapon/types/Enums";

class GameRoom {
    
    readonly id: number;
    readonly gameMode: GameModeEnum;
    readonly gameMapId: number;

    readonly memberManager: MemberManager;
    readonly phaseManager: PhaseManager;
    readonly economyManager: EconomyManager;
    readonly bombManager: BombManager;

    private marker: AlliesMarker;
    private markerTaskId = -1;

    constructor(id: number, gameMode: GameModeEnum, gameMapId: number) {
        this.id = id;
        this.gameMode = gameMode;
        this.gameMapId = gameMapId;

        this.memberManager = new MemberManager(id);
        this.phaseManager = new PhaseManager(id);
        this.economyManager = new EconomyManager(id);
        this.bombManager = new BombManager(id);

        this.marker = new AlliesMarker(this.memberManager);
        this.markerTaskId = system.runInterval(() => {
            this.marker.updateMark(TeamTagEnum.Attacker);
            this.marker.updateMark(TeamTagEnum.Defender);
            this.marker.updateMark(TeamTagEnum.Spectator);
        });
    }

    close() {
        system.clearRun(this.markerTaskId);
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
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId)!.close();
        }
        return this.rooms.delete(roomId);
    }

    getAllRooms() {
        return Array.from(this.rooms.entries());
    }
}