import { GameRoomManager } from "../../gameroom/GameRoom";
import { GameOverPhase } from "./Gameover";
import { RoundEndPhase } from "./RoundEnd";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action";

import { Config } from "./_config";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum"
import { TeamEnum } from "../../../types/TeamEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { Broadcast } from "../../../utils/Broadcast";
import { set_variable } from "../../../utils/Variable";

const config = Config.action;

const enum EndReasonEnum {
    'Time-up' = 1,
    'Attacker-Eliminated',
    'Attacker-Disconnect',
    'Defender-Eliminated',
    'Defender-Disconnect'
};

const endReasonTable = {
    [EndReasonEnum['Time-up']]: {
        winner: TeamEnum.Defender,
        message: [
            `${FC.Yellow}Time Up. This Round Is Over.\n`,
            `${FC.Yellow}Defenders Win.\n`
        ],
        nextPhaseGenerator: (roomId: number) => new RoundEndPhase(roomId)
    },
    [EndReasonEnum['Attacker-Eliminated']]: {
        winner: TeamEnum.Defender,
        message: [
            `${FC.Yellow}Attackers Have Been Eliminated.\n`,
            `${FC.Yellow}Defenders Win.\n`
        ],
        nextPhaseGenerator: (roomId: number) => new RoundEndPhase(roomId)
    },
    [EndReasonEnum['Attacker-Disconnect']]: {
        winner: TeamEnum.Defender,
        message: [
            `${FC.Yellow}Attackers Have Been Eliminated.\n`,
            `${FC.Yellow}Defenders Win.\n`
        ],
        nextPhaseGenerator: (roomId: number) => new GameOverPhase(roomId)
    },
    [EndReasonEnum['Defender-Eliminated']]: {
        winner: TeamEnum.Attacker,
        message: [
            `${FC.Yellow}Defenders Have Been Eliminated.\n`,
            `${FC.Yellow}Attackers Win.\n`
        ],
        nextPhaseGenerator: (roomId: number) => new RoundEndPhase(roomId)
    },
    [EndReasonEnum['Defender-Disconnect']]: {
        winner: TeamEnum.Attacker,
        message: [
            `${FC.Yellow}Defenders Have Been Eliminated.\n`,
            `${FC.Yellow}Attackers Win.\n`
        ],
        nextPhaseGenerator: (roomId: number) => new GameOverPhase(roomId)
    }
}

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
        const room = GameRoomManager.getRoom(this.roomId);
        const member = room.memberManager;
        const phase = room.phaseManager;

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
            const result = endReasonTable[endReason];

            Broadcast.message([separator, ...result.message, separator]);

            set_variable(`${this.roomId}.round_winner`, result.winner);
            phase.updatePhase(result.nextPhaseGenerator(this.roomId));
        }
    }

}