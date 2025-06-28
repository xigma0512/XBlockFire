import { GameRoomManager } from "../../gameroom/GameRoom";
import { GameOverPhase } from "./Gameover";
import { RoundEndPhase } from "./RoundEnd";

import { Config } from "./_config";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum"
import { TeamEnum } from "../../../types/TeamEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { Broadcast } from "../../../utils/Broadcast";
import { set_variable } from "../../../utils/Variable";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action";

const config = Config.action;

export class ActionPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.Action;
    readonly hud: ActionHud;
    private _currentTick: number = config.ACTION_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) {
        this.hud = new ActionHud(roomId);
    }

    on_entry() {
        this._currentTick = config.ACTION_TIME;
        console.warn(`[Room ${this.roomId}] Entry BP:action phase.`);
    }

    on_running() {
        this._currentTick --;
        this.hud.update();
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
            let nextPhase: IPhaseHandler = new RoundEndPhase(this.roomId);
    
            let winner = TeamEnum.Defender;
            switch (endReason) {
                case EndReasonEnum['Time-up']:
                    message.push(`${FC.Yellow}Time Up. This Round Is Over.\n`);
                    message.push(`${FC.Yellow}Blue Team Win\n`);
                    winner = TeamEnum.Defender;
                    break;

                case EndReasonEnum['Attacker-Disconnect']:
                    nextPhase = new GameOverPhase(this.roomId);
                case EndReasonEnum['Attacker-Eliminated']:
                    message.push(`${FC.Yellow}Blue Team Win\n`);
                    winner = TeamEnum.Defender;
                    break;

                case EndReasonEnum['Defender-Disconnect']:
                    nextPhase = new GameOverPhase(this.roomId);
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