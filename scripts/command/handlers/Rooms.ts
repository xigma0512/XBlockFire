import { gameroom, GameRoomFactory } from "../../base/gameroom/GameRoom";
import { PhaseManager } from "../../base/gamephase/PhaseManager";
import { MemberManager } from "../../base/gameroom/member/MemberManager";

import { PreRoundStartPhase } from "../../base/gamephase/bomb_plant/PreRoundStart";

import { GameModeEnum } from "../../types/gameroom/GameModeEnum";

import { FormatCode as FC } from "../../utils/FormatCode";

import { Player } from "@minecraft/server";

function createRoom(executer: Player, ...args: string[]) {
    const [gamemode, mapId] = args;

    if (!gamemode || !mapId) {
        throw Error("Missing argument '<gamemode>' or '<map_id>'. Usage: /scriptevent blockfire:room create <gamemode> <mapId>");
    }

    if (!Object.values<string>(GameModeEnum).includes(gamemode)) {
        throw Error(`Unknown mode ${gamemode}.`);
    }

    GameRoomFactory.createRoom(gamemode as GameModeEnum, Number(mapId));
    executer.sendMessage(`${FC.Gray}>> ${FC.Yellow}Create room successfully.`);
}

function playerJoin(executer: Player) {    
    if (MemberManager.includePlayer(executer)) throw Error(`You have already in game.`);

    MemberManager.joinRoom(executer);
    executer.sendMessage(`${FC.Gray}>> ${FC.Green}You join the room `);
}

function playerLeave(executer: Player) {
    if (MemberManager.includePlayer(executer)) throw Error(`You are not in game.`);

    MemberManager.leaveRoom(executer);
    executer.sendMessage(`${FC.Gray}>> ${FC.Red}You leave the room `);
}

function forceStart(executer: Player) {
    const startPhase = {
        [GameModeEnum.BombPlant]: new PreRoundStartPhase()
    };
    PhaseManager.updatePhase(startPhase[gameroom.gameMode]);
    executer.sendMessage(`${FC.Gray}>> ${FC.LightPurple}Force start.`);
}

function roomCmd(executer: Player, ...args: string[]) {
    const cmdType = args[0];
    if (!cmdType) throw Error('Missing arguments <type>. Usage: /scriptevent blockfire:room <type> <...args>');

    args.splice(0, 1);
    switch(cmdType) {
        case 'create': createRoom(executer, ...args); break;
        case 'join': playerJoin(executer); break;
        case 'leave': playerLeave(executer); break;
        case 'start': forceStart(executer); break;
        default: 
            throw Error(`there is no command type as ${cmdType}`);
            break;
    }
}

export { roomCmd };