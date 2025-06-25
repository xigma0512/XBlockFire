import { GameRoomManager } from "../../GameRoom";
import { BP_GameOverPhase } from "./Gameover";
import { BP_RoundEndPhase } from "./RoundEnd";

import { BP_Config } from "./Config";
import { BP_PhaseEnum } from "../../../types/PhaseEnum"
import { TeamEnum } from "../../../types/TeamEnum";

import { FormatCode as FC } from "../../../../../utils/FormatCode";
import { Broadcast } from "../../../../../utils/Broadcast";
import { entity_dynamic_property } from "../../../../../utils/Property";
import { set_variable, variable } from "../../../../../utils/Variable";

const config = BP_Config.action;

export class BP_ActionPhase implements IPhaseHandler {

    readonly phaseTag = BP_PhaseEnum.Action;
    private _currentTick: number = config.ACTION_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) { }

    on_entry() {
        this._currentTick = config.ACTION_TIME;
        console.warn(`[Room ${this.roomId}] Entry BP:action phase.`);
    }

    on_running() {
        this._currentTick --;
        updateSidebar(this.roomId);
        updateTopbar(this.roomId, this.currentTick);
        this.transitions();
    }
    
    on_exit() {
        console.warn(`[Room ${this.roomId}] Exit BP:action phase.`);
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const member = room.memberManager;
        const phase = room.phaseManager;

        const enum EndReasonEnum {
            'Time-up' = 1,
            'Attacker-Eliminated',
            'Attacker-Disconnect',
            'Defender-Eliminated',
            'Defender-Disconnect'
        }

        let endReason: EndReasonEnum | null = null;

        const attackers = member.getPlayers({ team: TeamEnum.Attacker });
        const defenders = member.getPlayers({ team: TeamEnum.Defender });

        const attackersAlive = member.getPlayers({ team: TeamEnum.Attacker, is_alive: true });
        const defendersAlive = member.getPlayers({ team: TeamEnum.Defender, is_alive: true });
        
        if (attackersAlive.length === 0) endReason = EndReasonEnum['Attacker-Eliminated'];
        if (defendersAlive.length === 0) endReason = EndReasonEnum['Defender-Eliminated'];

        if (attackers.length === 0) endReason = EndReasonEnum['Attacker-Disconnect'];
        if (defenders.length === 0) endReason = EndReasonEnum['Defender-Disconnect'];

        if (this.currentTick <= 0) endReason = EndReasonEnum['Time-up'];
    
        if (endReason) {

            const separator = `${FC.White}---------------\n`;
            let message = [separator];
            let nextPhase: IPhaseHandler = new BP_RoundEndPhase(this.roomId);
    
            let winner = TeamEnum.Defender;
            switch (endReason) {
                case EndReasonEnum['Time-up']:
                    message.push(`${FC.Yellow}Time Up. This Round Is Over.\n`);
                    message.push(`${FC.Yellow}Blue Team Win\n`);
                    winner = TeamEnum.Defender;
                    break;

                case EndReasonEnum['Attacker-Disconnect']:
                    nextPhase = new BP_GameOverPhase(this.roomId);
                case EndReasonEnum['Attacker-Eliminated']:
                    message.push(`${FC.Yellow}Blue Team Win\n`);
                    winner = TeamEnum.Defender;
                    break;

                case EndReasonEnum['Defender-Disconnect']:
                    nextPhase = new BP_GameOverPhase(this.roomId);
                case EndReasonEnum['Defender-Eliminated']:
                    message.push(`${FC.Yellow}Red Team Win\n`);
                    winner = TeamEnum.Attacker;
                    break;
            }

            message.push(separator);
            Broadcast.message(message);

            set_variable(`${this.roomId}.round_winner`, winner);
            phase.updatePhase(nextPhase);
        }
    }

}

function updateSidebar(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();

    for (const player of players) {
        const playerTeam = entity_dynamic_property(player, 'player:team') as TeamEnum;
        const teamStr = 
            (playerTeam === TeamEnum.Attacker) ? `${FC.Red}Attacker` :
            (playerTeam === TeamEnum.Defender) ? `${FC.Aqua}Defender` :
                                                    `${FC.Gray}Spectator` 

        const sidebarMessage = [
            `Money: ${FC.Green}${room.economyManager.getMoney(player)}`,
            `Team: ${teamStr}`
        ];

        Broadcast.sidebar(sidebarMessage, [player]);
    }
}

function updateTopbar(roomId: number, currentTick: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    
    const attackerScore = variable(`${roomId}.attacker_score`) ?? 0;
    const defenderScore = variable(`${roomId}.defender_score`) ?? 0;

    const attackerPlayers = room.memberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: true });
    const defenderPlayers = room.memberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });
    
    const players = room.memberManager.getPlayers();
    for (const player of players) {
        const playerTeam = entity_dynamic_property(player, 'player:team') as TeamEnum;

        const [allies, allyTeamScore] = (playerTeam === TeamEnum.Attacker) ? [attackerPlayers, attackerScore] : [defenderPlayers, defenderScore];
        const [enemies, enemyTeamScore] = (playerTeam === TeamEnum.Attacker) ? [defenderPlayers, defenderScore] : [attackerPlayers, attackerScore];

        const seconds = Number((currentTick / 20).toFixed(0));
        const topbarMessage = [
            `[ ${allyTeamScore} ] - [ ${Math.floor(seconds / 60)}:${seconds % 60} ] - [ ${enemyTeamScore} ]`,
            `[ ${FC.Green}${allies.map(p => p.name.substring(0, 3)).join(' ')}${FC.Reset} ] VS [ ${FC.Red}${enemies.map(p => p.name.substring(0, 3)).join(' ')}${FC.Reset} ]`
        ];

        Broadcast.topbar(topbarMessage, [player]);
    }
}