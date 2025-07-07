import { GameRoomManager } from "../../gameroom/GameRoom";
import { GameOverPhase } from "./Gameover";
import { PreRoundStartPhase } from "./PreRoundStart";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action"; 

import { Config } from "./_config";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";
import { TeamEnum } from "../../../types/TeamEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../../utils/Property";
import { set_variable, variable } from "../../../utils/Variable";


const config = Config.roundEnd;

export class RoundEndPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.RoundEnd;
    readonly hud: ActionHud;
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) {
        this.hud = new ActionHud(roomId);
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        processWinner(this.roomId);
        console.warn(`[Room ${this.roomId}] Entry BP:roundEnd phase.`);
    }

    on_running() {
        this._currentTick --;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        console.warn(`[Room ${this.roomId}] Exit BP:roundEnd phase.`);
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const phase = room.phaseManager;

        const attackerScore = variable(`${this.roomId}.attacker_score`);
        const defenderScore = variable(`${this.roomId}.defender_score`);

        let winner = null;
        if (attackerScore >= config.WINNING_SCORE) winner = TeamEnum.Attacker;
        if (defenderScore >= config.WINNING_SCORE) winner = TeamEnum.Defender;

        if (winner) {
            set_variable(`${this.roomId}.winner`, winner);
            phase.updatePhase(new GameOverPhase(this.roomId));
            return;
        }

        if (this.currentTick <= 0) {
            
            if (attackerScore + defenderScore == config.WINNING_SCORE - 1) {
                switchSide(this.roomId);
            }
            
            phase.updatePhase(new PreRoundStartPhase(this.roomId));
        }
    }

}

function switchSide(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const member = room.memberManager;
    for (const player of member.getPlayers()) {
        const playerTeam = entity_dynamic_property(player, 'player:team');
        set_entity_dynamic_property(player, 'player:team', (playerTeam === TeamEnum.Attacker) ? TeamEnum.Defender : TeamEnum.Attacker);
    
        // reset player money
        room.economyManager.setMoney(player, 800);
        // clear players inventory
        set_entity_dynamic_property(player, 'player:is_alive', false);
    }

    const attacker_score = variable(`${roomId}.attacker_score`);
    const defender_score = variable(`${roomId}.defender_score`);

    set_variable(`${roomId}.attacker_score`, defender_score);
    set_variable(`${roomId}.defender_score`, attacker_score);
}

function processWinner(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const member = room.memberManager;
    const economy = room.economyManager;

    const winnerTeam = variable(`${roomId}.round_winner`) as TeamEnum;
    if (winnerTeam === TeamEnum.Attacker) {
        set_variable(`${roomId}.attacker_score`, variable(`${roomId}.attacker_score`) + 1);
    } else if (winnerTeam === TeamEnum.Defender) { 
        set_variable(`${roomId}.defender_score`, variable(`${roomId}.defender_score`) + 1);
    }

    for (const player of member.getPlayers()) {
        const playerTeam = entity_dynamic_property(player, 'player:team');
        const earn = config.INCOME[(playerTeam === winnerTeam) ? 0 : 1];
        economy.modifyMoney(player, earn);
        player.sendMessage(`${FC.Gray}Round Income: +${earn}`);
    }
}