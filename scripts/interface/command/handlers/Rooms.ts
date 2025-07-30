import { CommandPermissionLevel, CustomCommandOrigin, CustomCommandParamType, Player } from "@minecraft/server";

import { GameService } from "../../../application/services/GameService";
import { RoomService } from "../../../application/services/RoomService";
import { PlayerTeamService } from "../../../application/services/PlayerTeamService";

import { CommandRegistry } from "../CommandRegistry";

import { GameModeEnum } from "../../../declarations/enum/GameModeEnum";
import { TeamEnum } from "../../../declarations/enum/TeamEnum";

function setting_gamemode(origin: CustomCommandOrigin, ...args: any[]) {
    const [gamemode] = args;
    const {ret, message} = RoomService.setGamemode(gamemode);
    return { message, status: ret };
}

function setting_map(origin: CustomCommandOrigin, ...args: any[]) {
    const [mapId] = args;
    const {ret, message} = RoomService.setMap(Number(mapId));
    return { message, status: ret };
}

function forcestart(origin: CustomCommandOrigin, ...args: any[]) {
    const {ret, message} = GameService.startGame();
    return { message, status: ret };
}

function select_team(origin: CustomCommandOrigin, ...args: any[]) {
    const executer = origin.sourceEntity as Player;
    const [team] = args;
    const {ret, message} = PlayerTeamService.selectTeam(executer, team);
    return { message, status: ret };
}

function admin_select_team(origin: CustomCommandOrigin, ...args: any[]) {
    const players: Player[] = args[0];
    const team: TeamEnum = args[1];
    const {ret, message} = PlayerTeamService.admin_selectTeam(players, team);
    return { message, status: ret };
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