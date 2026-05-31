import { Player, world } from '@minecraft/server';
import { TeamEnum } from './TeamEnum';
import { HudDriver } from '../../ui/hud/drivers/HudDriver';
import { Language as L } from '../../utils/Language';
import { FormatCode as FC } from '../../utils/FormatCode';

interface PlayerOptions {
    team?: TeamEnum;
    is_alive?: boolean;
}

class _MemberManager {
    private static _instance: _MemberManager;
    static get instance() {
        return this._instance || (this._instance = new this());
    }

    private playerTeam = new Map<Player, TeamEnum>();

    joinRoom(player: Player) {
        this.playerTeam.set(player, TeamEnum.Spectator);
        HudDriver.chat(`${FC.Bold}${FC.Green}${L.translate('member.join', player.name)}`), this.getPlayers();
    }

    leaveRoom(player: Player) {
        this.playerTeam.delete(player);
        HudDriver.chat(`${FC.Bold}${FC.Red}${L.translate('member.leave', player.name)}`), this.getPlayers();
    }

    includePlayer(player: Player) {
        return this.playerTeam.has(player);
    }

    getPlayers(options: PlayerOptions = {}): Player[] {
        let players = world.getAllPlayers();

        if (options.team !== undefined) {
            players = players.filter((p) => this.getPlayerTeam(p) === options.team);
        }

        if (options.is_alive !== undefined) {
            players = players.filter((p) => {
                const isAlive = p.getDynamicProperty('player:is_alive') as boolean;
                return isAlive === options.is_alive;
            });
        }

        return players;
    }

    setPlayerTeam(player: Player, team: TeamEnum) {
        this.playerTeam.set(player, team);
    }

    getPlayerTeam(player: Player) {
        if (!this.playerTeam.has(player)) {
            this.playerTeam.set(player, TeamEnum.Spectator);
        }
        return this.playerTeam.get(player)!;
    }
}

export const MemberManager = _MemberManager.instance;

world.afterEvents.worldLoad.subscribe(() => {
    for (const player of world.getAllPlayers()) {
        MemberManager.joinRoom(player);
    }
});

world.afterEvents.playerSpawn.subscribe((ev) => {
    if (ev.initialSpawn) {
        MemberManager.joinRoom(ev.player);
    }
});

world.beforeEvents.playerLeave.subscribe((ev) => {
    MemberManager.leaveRoom(ev.player);
});
