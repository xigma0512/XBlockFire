import { gameroom, GameRoomFactory } from '../../modules/core/GameRoom';
import { PhaseManager } from '../../modules/core/gamephase/PhaseManager';
import { MemberManager } from '../../modules/player/MemberManager';

import { GameModeEnum } from '../../modules/core/GameModeEnum';

import { FormatCode as FC } from '../../utils/FormatCode';

import { TeamEnum } from '../../modules/player/TeamEnum';
import { MapRegister } from '../../modules/world/MapRegister';
import { HudDriver } from '../../ui/hud/drivers/HudDriver';
import { Language as L } from '../../utils/Language';

import { CommandPermissionLevel, CustomCommandOrigin, CustomCommandParamType, Player } from '@minecraft/server';
import { CommandRegistry } from '../CommandRegistry';

function setting_gamemode(origin: CustomCommandOrigin, ...args: any[]) {
    const [gamemode] = args;

    if (!Object.values<string>(GameModeEnum).includes(gamemode)) {
        return { message: `${FC.Gray}>> ${FC.Red}未知的遊戲模式`, status: 1 };
    }

    GameRoomFactory.createRoom(gamemode as GameModeEnum, gameroom().gameMapId);
    HudDriver.chat(`${FC.Yellow}遊戲模式 - ${FC.Green}${gamemode}`);
    return { message: `${FC.Gray}>> ${FC.Yellow}設定遊戲模式為 ${FC.Green}${gamemode}`, status: 0 };
}

function setting_map(origin: CustomCommandOrigin, ...args: any[]) {
    const mapId = Number(args[0]);
    if (!MapRegister.availableMaps.has(mapId)) {
        return { message: `${FC.Gray}>> ${FC.Red}未知的地圖編號`, status: 1 };
    }

    const map = MapRegister.getMap(mapId);
    GameRoomFactory.createRoom(gameroom().gameMode, mapId);
    HudDriver.chat(`$${FC.Yellow}遊戲地圖 - ${FC.Green}${map.name}`);
    return { message: `${FC.Gray}>> ${FC.Yellow}設定遊戲地圖為 ${FC.Green}${map.name}`, status: 0 };
}

function forcestart(origin: CustomCommandOrigin, ...args: any[]) {
    PhaseManager.updatePhase(gameroom().activeMode.createForceStartPhase());
    HudDriver.chat(`${FC.LightPurple}遊戲已強制開始`);
    return { message: `${FC.Gray}>> ${FC.LightPurple}強制開始`, status: 0 };
}

function select_team(origin: CustomCommandOrigin, ...args: any[]) {
    const executer = origin.sourceEntity;
    if (executer === undefined || !(executer instanceof Player)) {
        return { message: `${FC.Gray}>> ${FC.Red}請用玩家身分執行指令`, status: 1 };
    }

    const [team] = args;
    if (!Object.values<string>(TeamEnum).includes(team)) {
        return { message: `${FC.Gray}>> ${FC.Red}未知的隊伍名稱`, status: 1 };
    }

    MemberManager.setPlayerTeam(executer, team as TeamEnum);
    const text = FC.Yellow + L.translate('command.join_team', executer.name, team);
    HudDriver.chat(text);
}

function admin_select_team(origin: CustomCommandOrigin, ...args: any[]) {
    const players: Player[] = args[0];
    const team: TeamEnum = args[1];

    if (!Object.values<string>(TeamEnum).includes(team)) {
        return { message: `${FC.Gray}>> ${FC.Red}未知的隊伍名稱`, status: 1 };
    }

    for (const p of players) {
        MemberManager.setPlayerTeam(p, team as TeamEnum);
        const text = FC.Yellow + L.translate('command.join_team', p.name, team);
        HudDriver.chat(text);
    }
}

export function register() {
    CommandRegistry.addCustomCommandEnum('xblockfire:enum.gamemode', Object.values(GameModeEnum));
    CommandRegistry.addCustomCommandEnum('xblockfire:enum.team', Object.values(TeamEnum));

    CommandRegistry.addCustomCommand(
        {
            name: 'xblockfire:setting.gamemode',
            description: '設定遊戲模式',
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    type: CustomCommandParamType.Enum,
                    name: 'xblockfire:enum.gamemode',
                },
            ],
        },
        setting_gamemode
    );

    CommandRegistry.addCustomCommand(
        {
            name: 'xblockfire:setting.gamemap',
            description: '設定遊戲地圖',
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    type: CustomCommandParamType.Integer,
                    name: 'int.map_id',
                },
            ],
        },
        setting_map
    );

    CommandRegistry.addCustomCommand(
        {
            name: 'xblockfire:select_team',
            description: '選擇隊伍',
            permissionLevel: CommandPermissionLevel.Any,
            mandatoryParameters: [
                {
                    type: CustomCommandParamType.Enum,
                    name: 'xblockfire:enum.team',
                },
            ],
        },
        select_team
    );

    CommandRegistry.addCustomCommand(
        {
            name: 'xblockfire:admin.select_team',
            description: '[管理員] 選擇隊伍',
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    type: CustomCommandParamType.PlayerSelector,
                    name: 'selector.player',
                },
                {
                    type: CustomCommandParamType.Enum,
                    name: 'xblockfire:enum.team',
                },
            ],
        },
        admin_select_team
    );

    CommandRegistry.addCustomCommand(
        {
            name: 'xblockfire:forcestart',
            description: '強制開始遊戲',
            permissionLevel: CommandPermissionLevel.GameDirectors,
        },
        forcestart
    );
}
