import { Player } from "@minecraft/server";
import { MemberManager } from "../modules/player/MemberManager";
import { PhaseManager } from "../modules/core/gamephase/PhaseManager";
import { TeamEnum } from "../modules/player/TeamEnum";
import { FormatCode as FC } from "../utils/FormatCode";
import { variable } from "../utils/Variable";
import { gameroom } from "../modules/core/GameRoom";
import { MapRegister } from "../modules/world/MapRegister";
import { Language as L } from "../utils/Language";

export class GameStatusProvider {
    
    static getStatusTitle(viewer: Player, extraLine?: string): string {
        const viewerTeam = MemberManager.getPlayerTeam(viewer);
        
        // 1. Get scores
        const attackerScore = variable(`attacker_score`) || 0;
        const defenderScore = variable(`defender_score`) || 0;
        
        // 2. Get alive/dead counts
        const attackerTotal = MemberManager.getPlayers({ team: TeamEnum.Attacker }).length;
        const attackerAlive = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: true }).length;
        
        const defenderTotal = MemberManager.getPlayers({ team: TeamEnum.Defender }).length;
        const defenderAlive = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true }).length;

        // 3. Get time
        const phase = PhaseManager.getPhase();
        const seconds = Math.max(0, Math.floor(phase.currentTick / 20));
        const timeStr = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

        // Perspective & Color Logic
        // Team mapping: Attacker = Red, Defender = Aqua
        // Layout: Ally (Viewer's team) on LEFT, Enemy on RIGHT
        
        let leftScore: number, rightScore: number;
        let leftTotal: number, leftAlive: number, rightTotal: number, rightAlive: number;
        let leftColor: string, rightColor: string;

        if (viewerTeam === TeamEnum.Attacker) {
            // Attacker perspective: Attacker left (Red), Defender right (Aqua)
            leftScore = attackerScore;
            leftTotal = attackerTotal;
            leftAlive = attackerAlive;
            leftColor = FC.Red;

            rightScore = defenderScore;
            rightTotal = defenderTotal;
            rightAlive = defenderAlive;
            rightColor = FC.Aqua;
        } else {
            // Defender or Spectator perspective: Defender left (Aqua), Attacker right (Red)
            leftScore = defenderScore;
            leftTotal = defenderTotal;
            leftAlive = defenderAlive;
            leftColor = FC.Aqua;

            rightScore = attackerScore;
            rightTotal = attackerTotal;
            rightAlive = attackerAlive;
            rightColor = FC.Red;
        }

        const maxPlayers = Math.max(leftTotal, rightTotal, 1);
        
        // Build left icons (Align Right towards center)
        let leftIcons = "";
        const leftDead = leftTotal - leftAlive;
        // Padding spaces for alignment
        for (let i = 0; i < maxPlayers - leftTotal; i++) leftIcons += "  ";
        for (let i = 0; i < leftDead; i++) leftIcons += `${FC.Gray}□ `;
        for (let i = 0; i < leftAlive; i++) leftIcons += `${leftColor}■ `;

        // Build right icons (Align Left towards center)
        let rightIcons = "";
        const rightDead = rightTotal - rightAlive;
        for (let i = 0; i < rightAlive; i++) rightIcons += `${rightColor}■ `;
        for (let i = 0; i < rightDead; i++) rightIcons += `${FC.Gray}□ `;
        for (let i = 0; i < maxPlayers - rightTotal; i++) rightIcons += "  ";

        let mainLine = `${leftIcons}${leftColor}${leftScore} ${FC.Gray}|| ${FC.White}${timeStr} ${FC.Gray}|| ${rightColor}${rightScore} ${rightIcons}`;
        
        if (extraLine) {
            mainLine += `\n${extraLine}`;
        }

        return mainLine;
    }

    static getSidebar(showPlayers: boolean = false, showKD: boolean = false): string[] {
        const room = gameroom();
        const map = MapRegister.getMap(room.gameMapId);

        const lines: string[] = [
            L.translate("hud.sidebar.map", map.name),
            `${L.translate("hud.sidebar.mode")} ${FC.Yellow}${room.gameMode}`,
        ];

        if (showPlayers) {
            lines.push("");

            // Players List
            const attackers = MemberManager.getPlayers({ team: TeamEnum.Attacker });
            const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });
            const spectators = MemberManager.getPlayers({ team: TeamEnum.Spectator });

            const formatPlayerLine = (p: Player, color: string) => {
                let text = `${color}${p.name}`;
                if (showKD) {
                    const k = variable(`${p.name}.kills`) || 0;
                    const d = variable(`${p.name}.deaths`) || 0;
                    text += ` ${FC.Gray}[${k}/${d}]`;
                } else {
                    const status = (p.getDynamicProperty('player:is_alive') as boolean) ? "" : ` ${FC.Gray}[X]`;
                    text += status;
                }
                return text;
            }

            for (const p of defenders) {
                lines.push(formatPlayerLine(p, FC.Green));
            }
            for (const p of attackers) {
                lines.push(formatPlayerLine(p, FC.Red));
            }
            for (const p of spectators) {
                lines.push(`${FC.Gray}${p.name}`);
            }
        }

        return lines;
    }
}
