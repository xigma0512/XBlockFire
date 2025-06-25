import { GameRoomManager } from "../../GameRoom";
import { BP_GameOverPhase } from "./Gameover";
import { BP_RoundEndPhase } from "./RoundEnd";

import { BP_PhaseEnum } from "./PhaseEnum"
import { BP_TeamEnum } from "../TeamEnum";

import { FormatCode as FC } from "../../../../../utils/FormatCode";
import { Broadcast } from "../../../../../utils/Broadcast";
import { entity_dynamic_property } from "../../../../../utils/Property";
import { set_variable } from "../../../../../utils/Variable";

const ACTION_TIME = 120 * 20;

export class BP_ActionPhase implements IPhaseHandler {

    readonly phaseTag = BP_PhaseEnum.Action;
    private _currentTick: number = ACTION_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) { }

    on_entry() {
        this._currentTick = ACTION_TIME;
        console.warn(`[Room ${this.roomId}] Entry BP:action phase.`);
    }

    on_running() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const members = room.memberManager.getPlayers();
        
        const actionbarText = `${FC.Blue}Round time: ${(this.currentTick / 20).toFixed(0)}`;
        Broadcast.actionbar(actionbarText, members);

        this._currentTick --;
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

        const players = member.getPlayers();
        const attackers = players.filter(p => entity_dynamic_property(p, 'player:team') === BP_TeamEnum.Attacker);
        const defenders = players.filter(p => entity_dynamic_property(p, 'player:team') === BP_TeamEnum.Defender);

        const attackersAlive = attackers.filter(p => entity_dynamic_property(p, 'player:is_alive'));
        const defendersAlive = defenders.filter(p => entity_dynamic_property(p, 'player:is_alive'));
        
        if (attackersAlive.length === 0) endReason = EndReasonEnum['Attacker-Eliminated'];
        if (defendersAlive.length === 0) endReason = EndReasonEnum['Defender-Eliminated'];

        if (attackers.length === 0) endReason = EndReasonEnum['Attacker-Disconnect'];
        if (defenders.length === 0) endReason = EndReasonEnum['Defender-Disconnect'];

        if (this.currentTick <= 0) endReason = EndReasonEnum['Time-up'];
    
        if (endReason) {

            const separator = `${FC.White}---------------\n`;
            let message = [separator];
            let nextPhase: IPhaseHandler = new BP_RoundEndPhase(this.roomId);
    
            let winner = BP_TeamEnum.Defender;
            switch (endReason) {
                case EndReasonEnum['Time-up']:
                    message.push(`${FC.Yellow}Time Up. This Round Is Over.\n`);
                    message.push(`${FC.Yellow}Blue Team Win\n`);
                    winner = BP_TeamEnum.Defender;
                    break;

                case EndReasonEnum['Attacker-Disconnect']:
                    nextPhase = new BP_GameOverPhase(this.roomId);
                case EndReasonEnum['Attacker-Eliminated']:
                    message.push(`${FC.Yellow}Blue Team Win\n`);
                    winner = BP_TeamEnum.Defender;
                    break;

                case EndReasonEnum['Defender-Disconnect']:
                    nextPhase = new BP_GameOverPhase(this.roomId);
                case EndReasonEnum['Defender-Eliminated']:
                    message.push(`${FC.Yellow}Red Team Win\n`);
                    winner = BP_TeamEnum.Attacker;
                    break;
            }

            message.push(separator);
            Broadcast.message(message);

            set_variable(`${this.roomId}.round_winner`, winner);
            phase.updatePhase(nextPhase);
        }
    }

}