import { gameroom, GameRoomFactory } from "../../base/gameroom/GameRoom";
import { PhaseManager } from "../../base/gamephase/PhaseManager";
import { MemberManager } from "../../base/member/MemberManager";

import { PreRoundStartPhase } from "../../base/gamephase/bomb_plant/PreRoundStart";

import { GameModeEnum } from "../../types/gameroom/GameModeEnum";

import { FormatCode as FC } from "../../utils/FormatCode";
import { set_entity_dynamic_property } from "../../utils/Property";

import { Player } from "@minecraft/server";
import { TeamEnum } from "../../types/TeamEnum";
import { Broadcast } from "../../utils/Broadcast";

function createRoom(executer: Player, ...args: string[]) {
    const [gamemode, mapId] = args;

    if (gamemode === undefined || mapId === undefined) {
        throw Error("Missing argument '<gamemode>' or '<map_id>'. Usage: /scriptevent blockfire:room create <gamemode> <mapId>");
    }

    if (!Object.values<string>(GameModeEnum).includes(gamemode)) {
        throw Error(`Unknown mode ${gamemode}.`);
    }

    GameRoomFactory.createRoom(gamemode as GameModeEnum, Number(mapId));
    executer.sendMessage(`${FC.Gray}>> ${FC.Yellow}Created room.`);
}

function playerJoin(executer: Player) {    
    if (MemberManager.includePlayer(executer)) throw Error(`You are already in the game.`);

    MemberManager.joinRoom(executer);
    executer.sendMessage(`${FC.Gray}>> ${FC.Green}You join the room `);
}

function playerLeave(executer: Player) {
    if (MemberManager.includePlayer(executer)) throw Error(`You are not in the game.`);

    MemberManager.leaveRoom(executer);
    executer.sendMessage(`${FC.Gray}>> ${FC.Red}You leave the room `);
}

function forceStart(executer: Player) {
    const startPhase = {
        [GameModeEnum.BombPlant]: new PreRoundStartPhase()
    };
    PhaseManager.updatePhase(startPhase[gameroom().gameMode]);
    executer.sendMessage(`${FC.Gray}>> ${FC.LightPurple}Force start.`);
}

function selectTeam(executer: Player, ...args: string[]) {
    const [team] = args;
    if (team === undefined) {
        throw Error("Missing argument '<team>'. Usage: /scriptevent blockfire:room select_team <team>");
    }

    if (!Object.values<string>(TeamEnum).includes(team)) {
        throw Error(`Unknown mode ${team}.`);
    }

    set_entity_dynamic_property(executer, 'player:team', team as TeamEnum);
    Broadcast.message(`${FC.Gold}${executer.name} join [${team}]`);
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
        case 'select_team': selectTeam(executer, ...args); break;
        default: 
            throw Error(`there is no command type as ${cmdType}`);
            break;
    }
}

export { roomCmd };