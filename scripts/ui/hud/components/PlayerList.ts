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

        const formatLine = (p: Player, color: string) => {
            let text = `${FC.Gray}- ${color}${p.name}`;
            if (showKD) {
                const k = variable(`${p.name}.kills`) || 0;
                const d = variable(`${p.name}.deaths`) || 0;
                text += ` ${FC.Gray}[${k}/${d}]`;
            }
            return text;
        }

        for (const p of defenders) lines.push(formatLine(p, FC.Green));
        for (const p of attackers) lines.push(formatLine(p, FC.Red));
        for (const p of spectators) lines.push(`${FC.Gray}- ${p.name}`);

        return lines;
    }
}
