import { Player } from '@minecraft/server';
import { MemberManager } from '../../../modules/player/MemberManager';
import { TeamEnum } from '../../../modules/player/TeamEnum';
import { FormatCode as FC } from '../../../utils/FormatCode';
import { Language as L } from '../../../utils/Language';
import { variable } from '../../../utils/Variable';

export class PlayerList {
    /**
     * Returns an array of formatted player lines for the sidebar
     */
    static format(showKD: boolean = false): string[] {
        const attackers = MemberManager.getPlayers({ team: TeamEnum.Attacker });
        const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });
        const spectators = MemberManager.getPlayers({ team: TeamEnum.Spectator });

        const playerNum = attackers.length + defenders.length + spectators.length;
        const lines: string[] = ['', `${FC.White}${L.translate('hud.sidebar.players', FC.Yellow + playerNum)}`];

        const sortPlayers = (players: Player[]) => {
            return [...players].sort((a, b) => {
                const kA = variable(`${a.name}.kills`) || 0;
                const kB = variable(`${b.name}.kills`) || 0;
                if (kB !== kA) return kB - kA;
                return a.name.localeCompare(b.name);
            });
        };

        // const getPlayerPing = (p: Player) => {
        //     const ping = p.getPing();
        //     if (ping < 50) return `${FC.Green}(${ping})`;
        //     if (ping < 100) return `${FC.MaterialGold}(${ping})`;
        //     return `${FC.Red}(${ping})`;
        // }

        const formatLine = (p: Player, color: string) => {
            let text = `${FC.Gray}- ${color}${p.name}`;
            if (showKD) {
                // const ping = getPlayerPing(p);
                const k = variable(`${p.name}.kills`) || 0;
                const d = variable(`${p.name}.deaths`) || 0;
                text += `${FC.Gray}[${k}/${d}]`;
            }
            return text;
        };

        const sortedDefenders = sortPlayers(defenders);
        const sortedAttackers = sortPlayers(attackers);

        for (const p of sortedDefenders) lines.push(formatLine(p, FC.Aqua));
        for (const p of sortedAttackers) lines.push(formatLine(p, FC.Gold));

        if (spectators.length > 0) {
            for (const p of spectators) {
                // const ping = getPlayerPing(p);
                lines.push(`${FC.Gray}- ${p.name}`);
            }
        }

        return lines;
    }
}
