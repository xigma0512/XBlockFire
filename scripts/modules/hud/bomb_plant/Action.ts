import { GameRoomManager } from "../../../base/gameroom/GameRoom";

import { TeamEnum } from "../../../types/TeamEnum";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";

import { Broadcast } from "../../../utils/Broadcast";
import { FormatCode as FC } from "../../../utils/FormatCode";
import { entity_dynamic_property } from "../../../utils/Property";
import { variable } from "../../../utils/Variable";

import { Player } from "@minecraft/server";

export class ActionHud implements InGameHud {
    
    constructor(private readonly roomId: number) { }
    
    update() {
        this.updateActionbar();
        this.updatebar();
    }

    private updateActionbar() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const phase = room.phaseManager.getPhase();
        const members = room.memberManager.getPlayers();

        let actionbarText: string | string[] = '';
        switch (phase.phaseTag) {
            case BombPlantPhaseEnum.Buying:
                actionbarText = [
                    `Buying phase will end in ${(phase.currentTick / 20).toFixed(0)} seconds.\n`, 
                    `Right-click the feather to open the shop.`
                ];
                break;
            case BombPlantPhaseEnum.RoundEnd:
                actionbarText = `${FC.Yellow}Next round start in ${(phase.currentTick / 20).toFixed(0)} seconds.`;
                break;
            case BombPlantPhaseEnum.Gameover:
                actionbarText = `Return lobby in ${(phase.currentTick / 20).toFixed(0)}`;
                break;
        }

        Broadcast.actionbar(actionbarText, members);
    }

    private updatebar() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const players = room.memberManager.getPlayers();
        
        for (const player of players) {
            const sidebarMessage = this.getSidebarMessage(player);
            const topbarMessage = this.getTopbarMessage(player);
            Broadcast.updatebar(topbarMessage, sidebarMessage, [player]);
        }
    }
    
    private getSidebarMessage(player: Player) {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const playerTeam = entity_dynamic_property(player, 'player:team') as TeamEnum;
        const teamStr = 
        (playerTeam === TeamEnum.Attacker) ? `${FC.Red}Attacker` :
        (playerTeam === TeamEnum.Defender) ? `${FC.Aqua}Defender` : `${FC.Gray}Spectator` 
        
        const sidebarMessage = [
            `Money: ${FC.Green}${room.economyManager.getMoney(player)}`,
            `Team: ${teamStr}`
        ];
        
        return sidebarMessage;
    }
    
    private getTopbarMessage(player: Player) {

        const room = GameRoomManager.instance.getRoom(this.roomId);
        const currentTick = room.phaseManager.getPhase().currentTick;
        
        const attackerScore = variable(`${this.roomId}.attacker_score`);
        const defenderScore = variable(`${this.roomId}.defender_score`);
        
        const attackerPlayers = room.memberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: true });
        const defenderPlayers = room.memberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });

        const playerTeam = entity_dynamic_property(player, 'player:team') as TeamEnum;

        const [allies, allyTeamScore] = (playerTeam === TeamEnum.Attacker) ? [attackerPlayers, attackerScore] : [defenderPlayers, defenderScore];
        const [enemies, enemyTeamScore] = (playerTeam === TeamEnum.Attacker) ? [defenderPlayers, defenderScore] : [attackerPlayers, attackerScore];

        const seconds = Number((currentTick / 20).toFixed(0));
        const topbarMessage = [
            `[ ${allyTeamScore} ] - [ ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} ] - [ ${enemyTeamScore} ]`,
            `[ ${FC.Green}${allies.map(p => p.name.substring(0, 3)).join(' ')}${FC.Reset} ] VS [ ${FC.Red}${enemies.map(p => p.name.substring(0, 3)).join(' ')}${FC.Reset} ]`
        ];

        return topbarMessage;
    }
}