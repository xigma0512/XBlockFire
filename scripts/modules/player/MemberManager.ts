import { Player, system, world } from '@minecraft/server';
import { TeamEnum } from './TeamEnum';
import { HudDriver } from '../../ui/hud/drivers/HudDriver';
import { Sound } from '../../ui/media/Sound';
import { Language as L } from '../../utils/Language';
import { FormatCode as FC } from '../../utils/FormatCode';

const MEMBER_JOIN_SOUND_ID = 'random.pop';
const MEMBER_LEAVE_SOUND_ID = 'random.pop2';

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
        const text = FC.Green + L.translate('member.join', player.name);
        HudDriver.chat(text, this.getPlayers());
        Sound.playTo(MEMBER_JOIN_SOUND_ID, this.getPlayers(), { pitch: 1.4, volume: 0.8 });
    }

    leaveRoom(player: Player, playerName = player.name) {
        this.playerTeam.delete(player);
        const text = FC.Red + L.translate('member.leave', playerName);
        HudDriver.chat(text, this.getPlayers());
        Sound.playTo(MEMBER_LEAVE_SOUND_ID, this.getPlayers(), { pitch: 0.8, volume: 0.8 });
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
    const player = ev.player;
    const playerName = ev.player.name;
    system.run(() => MemberManager.leaveRoom(player, playerName));
});
