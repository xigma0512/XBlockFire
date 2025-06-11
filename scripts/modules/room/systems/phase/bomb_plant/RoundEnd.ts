import { GameRoomManager } from "../../GameRoom";
import { BombPlant_BuyingPhase } from "./Buying";
import { BombPlant_GameOverPhase } from "./Gameover";

import { BombPlant_GamePhaseEnum } from "../../../types/Enum";
import { TeamTagEnum } from "../../../../weapon/types/Enums";
import { ColorTable, ColorType } from "../../../../../utils/Color";
import { entity_dynamic_property } from "../../../../../utils/Property";
import { set_variable, variable } from "../../../../../utils/Variable";
import { Broadcast } from "../../../../../utils/Broadcast";

const INCOME = [4000, 2000];
const WINNING_SCORE = 7;
const COUNTDOWN_TIME = 10 * 20;

export class BombPlant_RoundEndPhase implements IPhaseHandler {

    readonly phaseTag = BombPlant_GamePhaseEnum.RoundEnd;
    private currentTick: number = COUNTDOWN_TIME;

    constructor(private readonly roomId: number) { }

    on_entry() {
        this.currentTick = COUNTDOWN_TIME;

        const room = GameRoomManager.instance.getRoom(this.roomId);
        const member = room.memberManager;
        const economy = room.economyManager;

        const winnerTeam = variable(`${this.roomId}.round_winner`) as TeamTagEnum;
        if (winnerTeam === TeamTagEnum.Attacker) {
            set_variable(`${this.roomId}.attacker_score`, (variable(`${this.roomId}.attacker_score`) ?? 0) + 1);
        } else if (winnerTeam === TeamTagEnum.Defender) { 
            set_variable(`${this.roomId}.defender_score`, (variable(`${this.roomId}.defender_score`) ?? 0) + 1);
        }

        for (const player of member.getPlayers()) {
            const playerTeam = entity_dynamic_property(player, 'player:team');
            const earn = INCOME[(playerTeam === winnerTeam) ? 0 : 1];
            economy.addMoney(player, earn);
            player.sendMessage(`${ColorTable[ColorType.Gray]}Round Income: +${earn}`);
        }

        console.warn('Entry BombPlant:roundEnd phase.');
    }

    on_running() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const members = room.memberManager.getPlayers();
        
        const actionbarText = `${ColorTable[ColorType.Yellow]}Next round start in ${(this.currentTick / 20).toFixed(0)} seconds.`;
        Broadcast.actionbar(actionbarText, members);
        
        this.currentTick --;
        this.transitions();
    }

    on_exit() {
        console.warn('Exit BombPlant:roundEnd phase.');
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const phase = room.phaseManager;

        const attackerScore = variable(`${this.roomId}.attacker_score`);
        const defenderScore = variable(`${this.roomId}.defender_score`);

        let winner = null;
        if (attackerScore >= WINNING_SCORE) winner = TeamTagEnum.Attacker;
        if (defenderScore >= WINNING_SCORE) winner = TeamTagEnum.Defender;

        if (winner) {
            set_variable(`${this.roomId}.winner`, winner);
            phase.updatePhase(new BombPlant_GameOverPhase(this.roomId));
            return;
        }

        if (this.currentTick <= 0) {
            
            if (attackerScore + defenderScore >= WINNING_SCORE) {
                switchSide();
            }
            
            phase.updatePhase(new BombPlant_BuyingPhase(this.roomId));
        }
    }

}

function switchSide() {
    console.warn('switching side!!');
}