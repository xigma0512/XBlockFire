import { Player } from "@minecraft/server";
import { TeamEnum } from "../../../modules/player/TeamEnum";
import { MemberManager } from "../../../modules/player/MemberManager";
import { FormatCode as FC } from "../../../utils/FormatCode";
import { variable } from "../../../utils/Variable";

export class PlayerList {
    /**
     * Returns an array of formatted player lines for the sidebar
     */
    static format(showKD: boolean = false): string[] {
        const lines: string[] = [];

        const attackers = MemberManager.getPlayers({ team: TeamEnum.Attacker });
        const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });
        const spectators = MemberManager.getPlayers({ team: TeamEnum.Spectator });

        const sortPlayers = (players: Player[]) => {
            return [...players].sort((a, b) => {
                const kA = variable(`${a.name}.kills`) || 0;
                const kB = variable(`${b.name}.kills`) || 0;
                if (kB !== kA) return kB - kA;
                return a.name.localeCompare(b.name);
            });
        };

        const formatLine = (p: Player, color: string) => {
            let text = `${FC.Gray}- ${color}${p.name}`;
            if (showKD) {
                const k = variable(`${p.name}.kills`) || 0;
                const d = variable(`${p.name}.deaths`) || 0;
                text += ` ${FC.Gray}[ ${k} / ${d} ]`;
            }
            return text;
        }

        const sortedDefenders = sortPlayers(defenders);
        const sortedAttackers = sortPlayers(attackers);

        for (const p of sortedDefenders) lines.push(formatLine(p, FC.Aqua));
        if (sortedDefenders.length > 0 && sortedAttackers.length > 0) lines.push("---");
        for (const p of sortedAttackers) lines.push(formatLine(p, FC.Gold));
        
        if (spectators.length > 0) {
            if (lines.length > 0) lines.push("");
            for (const p of spectators) lines.push(`${FC.Gray}- ${p.name}`);
        }

        return lines;
    }
}
