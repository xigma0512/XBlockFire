import { Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { GameModeEnum } from '../../../modules/core/GameModeEnum';
import { MemberManager } from '../../../modules/player/MemberManager';
import { TeamEnum } from '../../../modules/player/TeamEnum';
import { MapRegister } from '../../../modules/world/MapRegister';
import { FormatCode as FC } from '../../../utils/FormatCode';
import { TabbedActionForm } from '../common/TabbedActionForm';

type LobbyMenuAction = 'select_team' | 'select_map' | 'select_mode' | 'force_start' | 'admin_select_player';

type LobbyTabId = 'team' | 'map' | 'mode' | 'admin';

export class LobbyMenu {
    static async open(player: Player, tabId: LobbyTabId = 'team') {
        const form = new TabbedActionForm<LobbyMenuAction>().title('Game Menu').body('Choose an action.');

        form.tab('team', 'Team');
        form.tab('map', 'Map');
        form.tab('mode', 'Mode');
        form.tab('admin', 'Admin');

        for (const team of Object.values(TeamEnum)) {
            form.button('team', {
                text: team,
                action: 'select_team',
                value: team,
            });
        }

        for (const [mapId, map] of MapRegister.availableMaps.entries()) {
            form.button('map', {
                text: `${map.name}\n${map.description}`,
                action: 'select_map',
                value: String(mapId),
            });
        }

        for (const mode of Object.values(GameModeEnum)) {
            form.button('mode', {
                text: mode,
                action: 'select_mode',
                value: mode,
            });
        }

        form.button('admin', {
            text: 'Force Start',
            action: 'force_start',
        });
        form.button('admin', {
            text: 'Set Player Team',
            action: 'admin_select_player',
        });

        const response = await form.show(player, tabId);
        if (response.canceled || !response.action) return;

        if (response.action === 'select_team') runPlayerCommand(player, `xblockfire:select_team ${response.value}`);
        else if (response.action === 'select_map')
            runPlayerCommand(player, `xblockfire:setting.gamemap ${response.value}`);
        else if (response.action === 'select_mode')
            runPlayerCommand(player, `xblockfire:setting.gamemode ${response.value}`);
        else if (response.action === 'force_start') runPlayerCommand(player, 'xblockfire:forcestart');
        else if (response.action === 'admin_select_player') await this.openAdminPlayerMenu(player);

    }

    private static async openAdminPlayerMenu(player: Player) {
        const players = MemberManager.getPlayers();
        const form = new ActionFormData().title('Set Player Team').body('Choose a target player.');

        for (const target of players) {
            form.button(target.name);
        }

        const response = await form.show(player);
        if (response.canceled || response.selection === undefined) return;

        const target = players[response.selection];
        if (!target) return;

        await this.openAdminTeamMenu(player, target);
    }

    private static async openAdminTeamMenu(player: Player, target: Player) {
        const teams = Object.values(TeamEnum);
        const form = new ActionFormData().title('Set Player Team').body(`Target: ${target.name}`);

        for (const team of teams) {
            form.button(team);
        }

        const response = await form.show(player);
        if (response.canceled || response.selection === undefined) return;

        const team = teams[response.selection];
        if (!team) return;

        runPlayerCommand(player, `xblockfire:admin.select_team "${target.name}" ${team}`);
    }
}

function runPlayerCommand(player: Player, command: string) {
    try {
        player.runCommand(command);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        player.sendMessage(`${FC.Red}${message}`);
    }
}
