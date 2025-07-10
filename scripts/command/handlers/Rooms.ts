import { GameRoomManager } from "../../base/gameroom/GameRoom";
import { GameModeEnum } from "../../types/gameroom/GameModeEnum";
import { MemberManager } from "../../base/gameroom/member/MemberManager";
import { PreRoundStartPhase } from "../../base/gamephase/bomb_plant/PreRoundStart";

import { Player } from "@minecraft/server";

function createRoom(executer: Player, ...args: string[]) {
    const [gamemode, mapId] = args;
    if (!gamemode || !mapId) throw Error("Missing argument '<gamemode>' or '<map_id>'. Usage: /scriptevent blockfire:room create <gamemode> <mapId>");
    
    const roomId = GameRoomManager.createRoom(Number(gamemode), Number(mapId));
    executer.sendMessage(`Create room ${roomId} successfully.`);
}

function getRoomList(executer: Player) {
    const rooms = GameRoomManager.getAllRooms();
    for (const [serial, room] of rooms) {
        executer.sendMessage(`Serial: ${serial} | GameMapId: ${room.gameMapId} | GamemodeId: ${room.gameMode}`);
    }
}

function playerJoinRoom(executer: Player, ...args: string[]) {
    const roomId = args[0];
    if (!roomId) throw Error("Missing argument '<room_serial>'. Usage: /scriptevent blockfire:room join <room_serial>");
    
    const room = GameRoomManager.getRoom(Number(roomId));
    if (room.memberManager.includePlayer(executer)) throw Error(`You have already in room ${roomId}`);

    if (MemberManager.isInRoom(executer)) {
        const roomId = MemberManager.getPlayerRoomId(executer)!;
        const room = GameRoomManager.getRoom(roomId);
        room.memberManager.leaveRoom(executer);
    }

    room.memberManager.joinRoom(executer);
    executer.sendMessage(`Join room ${roomId}.`);
}

function playerLeaveRoom(executer: Player, ...args: string[]) {
    const roomId = args[0];
    if (!roomId) throw Error("Missing argument '<room_serial>'. Usage: /scriptevent blockfire:room leave <room_serial>");
    
    const room = GameRoomManager.getRoom(Number(roomId));
    if (!room.memberManager.includePlayer(executer)) throw Error(`You are not in room ${roomId}`);

    room.memberManager.leaveRoom(executer);
    executer.sendMessage(`Leave room ${roomId}.`);
}

function forceStart(executer: Player, ...args: string[]) {
    const roomId = args[0];
    if (!roomId) throw Error("Missing argument '<room_serial>'. Usage: /scriptevent blockfire:room start <room_serial>");

    const room = GameRoomManager.getRoom(Number(roomId));
    const startPhase = {
        [GameModeEnum.C4Plant]: new PreRoundStartPhase(Number(roomId))
    };
    room.phaseManager.updatePhase(startPhase[room.gameMode]);
    executer.sendMessage(`Force start ${roomId}`);
}

function roomCmd(executer: Player, ...args: string[]) {
    const cmdType = args[0];
    if (!cmdType) throw Error('Missing arguments <type>. Usage: /scriptevent blockfire:room <type> <...args>');

    args.splice(0, 1);
    switch(cmdType) {
        case 'create': createRoom(executer, ...args); break;
        case 'list': getRoomList(executer); break;
        case 'join': playerJoinRoom(executer, ...args); break;
        case 'leave': playerLeaveRoom(executer, ...args); break;
        case 'start': forceStart(executer, ...args); break;
        default: 
            executer.sendMessage(`there is no command type as ${cmdType}`)
            break;
    }
}

export { roomCmd };