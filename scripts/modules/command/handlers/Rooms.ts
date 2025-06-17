import { Player } from "@minecraft/server";
import { GameRoomManager } from "../../gameroom/systems/GameRoom";

function createRoom(executer: Player, ...args: string[]) {
    const [gamemode, mapId] = args;
    if (!gamemode || !mapId) throw Error("Missing argument '<gamemode>' or '<map_id>'. Usage: /scriptevent blockfire:room create <gamemode> <mapId>");
    
    const roomId = GameRoomManager.instance.createRoom(Number(gamemode), Number(mapId));
    executer.sendMessage(`Create room ${roomId} successfully.`);
}

function getRoomList(executer: Player) {
    const rooms = GameRoomManager.instance.getAllRooms();
    for (const [serial, room] of rooms) {
        executer.sendMessage(`Serial: ${serial} | GameMapId: ${room.gameMapId} | GamemodeId: ${room.gameMode}`);
    }
}

function playerJoinRoom(executer: Player, ...args: string[]) {
    const roomId = args[0];
    if (!roomId) throw Error("Missing argument '<room_serial>'. Usage: /scriptevent blockfire:room join <room_serial>");
    
    const room = GameRoomManager.instance.getRoom(Number(roomId));
    if (room.memberManager.includePlayer(executer)) throw Error(`You have already in room ${roomId}`);

    const allRooms = GameRoomManager.instance.getAllRooms();
    for (const [serial, room] of allRooms) {
        if (room.memberManager.includePlayer(executer)) {
            room.memberManager.leaveRoom(executer);
        }
    }

    room.memberManager.joinRoom(executer);
    executer.sendMessage(`Join room ${roomId}.`);
}

function playerLeaveRoom(executer: Player, ...args: string[]) {
    const roomId = args[0];
    if (!roomId) throw Error("Missing argument '<room_serial>'. Usage: /scriptevent blockfire:room leave <room_serial>");
    
    const room = GameRoomManager.instance.getRoom(Number(roomId));
    if (!room.memberManager.includePlayer(executer)) throw Error(`You are not in room ${roomId}`);

    room.memberManager.leaveRoom(executer);
    executer.sendMessage(`Leave room ${roomId}.`);
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
        default: 
            executer.sendMessage(`there is no command type as ${cmdType}`)
            break;
    }
}

export { roomCmd };