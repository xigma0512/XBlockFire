import { gameroom, GameRoomFactory } from "../../../base/gameroom/GameRoom";
import { PhaseManager } from "../../../base/gamephase/PhaseManager";
import { MemberManager } from "../../../base/member/MemberManager";

import { PreRoundStartPhase } from "../../../base/gamephase/bomb_plant/PreRoundStart";

import { GameModeEnum } from "../../../shared/types/gameroom/GameModeEnum";

import { FormatCode as FC } from "../../../shared/utils/FormatCode";

import { TeamEnum } from "../../../shared/types/TeamEnum";
import { Broadcast } from "../../../shared/utils/Broadcast";
import { MapRegister } from "../../../base/gamemap/MapRegister";

import { CommandPermissionLevel, CustomCommandOrigin, CustomCommandParamType, Player } from "@minecraft/server";
import { CommandRegistry } from "../CommandRegistry";

function setting_gamemode(origin: CustomCommandOrigin, ...args: any[]) {
    const [gamemode] = args;

    if (!Object.values<string>(GameModeEnum).includes(gamemode)) {
        return { message: `${FC.Gray}>> ${FC.Red}未知的遊戲模式`, status: 1 }
    }

    GameRoomFactory.createRoom(gamemode as GameModeEnum, gameroom().gameMapId);
    return { message: `${FC.Gray}>> ${FC.Yellow}設定遊戲模式為 ${FC.Green}${gamemode}`, status: 0 }
}

function setting_map(origin: CustomCommandOrigin, ...args: any[]) {
    const mapId = Number(args[0]);
    if (!MapRegister.availableMaps.has(mapId)) {
        return { message: `${FC.Gray}>> ${FC.Red}未知的地圖編號`, status: 1 }
    }
    
    const map = MapRegister.getMap(mapId);
    GameRoomFactory.createRoom(gameroom().gameMode, mapId);
    return { message: `${FC.Gray}>> ${FC.Yellow}設定遊戲地圖為 ${FC.Green}${map.name}`, status: 0 };
}

function forcestart(origin: CustomCommandOrigin, ...args: any[]) {
    const startPhase = {
        [GameModeEnum.BombPlant]: new PreRoundStartPhase()
    };
    PhaseManager.updatePhase(startPhase[gameroom().gameMode]);
    return { message: `${FC.Gray}>> ${FC.LightPurple}Force start.`, status: 0 };
}

function select_team(origin: CustomCommandOrigin, ...args: any[]) {
    const executer = origin.sourceEntity;
    if (executer === undefined || !(executer instanceof Player)) {
        return { message: `${FC.Gray}>> ${FC.Red}請用玩家身分執行指令`, status: 1 }
    }

    const [team] = args;
    if (!Object.values<string>(TeamEnum).includes(team)) {
        return { message: `${FC.Gray}>> ${FC.Red}未知的隊伍名稱`, status: 1 }
    }

    MemberManager.setPlayerTeam(executer, team as TeamEnum);
    Broadcast.message(`${FC.Gold}${executer.name} 加入 [${team}]`);
}

function admin_select_team(origin: CustomCommandOrigin, ...args: any[]) {

    const players: Player[] = args[0];
    const team: TeamEnum = args[1];

    if (!Object.values<string>(TeamEnum).includes(team)) {
        return { message: `${FC.Gray}>> ${FC.Red}未知的隊伍名稱`, status: 1 }
    }

    for (const p of players) {
        MemberManager.setPlayerTeam(p, team as TeamEnum);
        Broadcast.message(`${FC.Gold}${p.name} 加入 [${team}]`);
    }
}

export function register() {

    CommandRegistry.addCustomCommandEnum('xblockfire:enum.gamemode', Object.values(GameModeEnum));
    CommandRegistry.addCustomCommandEnum('xblockfire:enum.team', Object.values(TeamEnum));

    CommandRegistry.addCustomCommand({
        name: "xblockfire:setting.gamemode",
        description: "設定遊戲模式",
        permissionLevel: CommandPermissionLevel.Admin,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'xblockfire:enum.gamemode'
            }
        ]
    }, setting_gamemode);

    CommandRegistry.addCustomCommand({
        name: "xblockfire:setting.gamemap",
        description: "設定遊戲地圖",
        permissionLevel: CommandPermissionLevel.Admin,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Integer,
                name: 'int.map_id'
            }
        ]
    }, setting_map);

    CommandRegistry.addCustomCommand({
        name: "xblockfire:select_team",
        description: "選擇隊伍",
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'xblockfire:enum.team'
            }
        ]
    }, select_team);

    CommandRegistry.addCustomCommand({
        name: "xblockfire:admin.select_team",
        description: "[管理員] 選擇隊伍",
        permissionLevel: CommandPermissionLevel.Admin,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'selector.player'
            },
            {
                type: CustomCommandParamType.Enum,
                name: 'xblockfire:enum.team'
            }
        ]
    }, admin_select_team);

    CommandRegistry.addCustomCommand({
        name: "xblockfire:forcestart",
        description: "強制開始遊戲",
        permissionLevel: CommandPermissionLevel.Admin
    }, forcestart);
}