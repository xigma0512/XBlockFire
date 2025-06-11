import { GameRoomManager } from "../../GameRoom";
import { BP_IdlePhase } from "./Idle";
import { BP_PhaseEnum } from "./PhaseEnum";

import { Broadcast } from "../../../../../utils/Broadcast";

const COUNTDOWN_TIME = 10 * 20;

export class BP_GameOverPhase implements IPhaseHandler {

    readonly phaseTag = BP_PhaseEnum.Gameover;
    private currentTick: number = COUNTDOWN_TIME;

    constructor(private readonly roomId: number) { }

    on_entry() {
        this.currentTick = COUNTDOWN_TIME;
        console.warn('Entry BP:gameover phase.');
    }

    on_running() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const members = room.memberManager.getPlayers();
        
        const actionbarText = `${(this.currentTick / 20).toFixed(0)}`;
        Broadcast.actionbar(actionbarText, members);

        this.currentTick --;
        this.transitions();
    }

    on_exit() {
        console.warn('Exit BP:gameover phase.');
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);

        if (this.currentTick <= 0) room.phaseManager.updatePhase(new BP_IdlePhase(this.roomId));
    }

}