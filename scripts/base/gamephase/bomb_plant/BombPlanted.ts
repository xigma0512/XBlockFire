import { GameRoomManager } from "../../gameroom/GameRoom";
import { RoundEndPhase } from "./RoundEnd";
import { GameOverPhase } from "./Gameover";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action";

import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";
import { TeamEnum } from "../../../types/TeamEnum";

import { Config } from "./_config";
import { set_variable } from "../../../utils/Variable";
import { FormatCode as FC } from "../../../utils/FormatCode";
import { Broadcast } from "../../../utils/Broadcast";

const config = Config.bombplanted;

const enum EndReasonEnum {
    'Time-up' = 1,
    'Defender-Eliminated',
    'Defender-Disconnect'
};

const endReasonTable = {
    [EndReasonEnum['Time-up']]: {
        winner: TeamEnum.Defender,
        message: [
            `${FC.Yellow}Bomb Has Exploded.\n`,
            `${FC.Yellow}Attackers Win.\n`
        ],
        nextPhaseGenerator: (roomId: number) => new RoundEndPhase(roomId)
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

export class BombPlantedPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.BombPlanted;
    readonly hud: ActionHud;
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) {
        this.hud = new ActionHud(roomId);
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        console.warn(`[Room ${this.roomId}] Entry BP:bomb_planted phase.`);
    }

    on_running() {
        this._currentTick --;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        console.warn(`[Room ${this.roomId}] Exit BP:bomb_planted phase.`);
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const member = room.memberManager;
        const phase = room.phaseManager;

        let endReason: EndReasonEnum | null = null;
    
        const defenders = member.getPlayers({ team: TeamEnum.Defender });
        const defendersAlive = member.getPlayers({ team: TeamEnum.Defender, is_alive: true });
    
        if (defendersAlive.length === 0) endReason = EndReasonEnum['Defender-Eliminated'];
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