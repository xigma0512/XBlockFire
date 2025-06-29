import { GameRoomManager } from "../../gameroom/GameRoom";
import { BuyingPhase } from "./Buying";
import { GameOverPhase } from "./Gameover";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action"; 
import { HotbarManager } from "../../../modules/hotbar/Hotbar";
import { HotbarTemplate } from "../../../modules/hotbar/HotbarTemplates";

import { Config } from "./_config";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";
import { TeamEnum } from "../../../types/TeamEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { entity_dynamic_property } from "../../../utils/Property";
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
        clearC4(this.roomId);
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
            
            if (attackerScore + defenderScore >= config.WINNING_SCORE) {
                switchSide();
            }
            
            phase.updatePhase(new BuyingPhase(this.roomId));
        }
    }

}

function switchSide() {
    console.warn('switching side!!');
}

function processWinner(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const member = room.memberManager;
    const economy = room.economyManager;

    const winnerTeam = variable(`${roomId}.round_winner`) as TeamEnum;
    if (winnerTeam === TeamEnum.Attacker) {
        set_variable(`${roomId}.attacker_score`, (variable(`${roomId}.attacker_score`) ?? 0) + 1);
    } else if (winnerTeam === TeamEnum.Defender) { 
        set_variable(`${roomId}.defender_score`, (variable(`${roomId}.defender_score`) ?? 0) + 1);
    }

    for (const player of member.getPlayers()) {
        const playerTeam = entity_dynamic_property(player, 'player:team');
        const earn = config.INCOME[(playerTeam === winnerTeam) ? 0 : 1];
        economy.modifyMoney(player, earn);
        player.sendMessage(`${FC.Gray}Round Income: +${earn}`);
    }
}

function clearC4(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();
    
    for (const player of players) {
        if (entity_dynamic_property(player, 'player:is_alive')) {
            // eslint-disable-next-line
            player.runCommand('clear @s xblockfire:c4');
            HotbarManager.updateHotbar(player);
        } else {   
            const playerTeam = entity_dynamic_property(player, 'player:team');
            HotbarManager.setHotbar(player, HotbarTemplate.initSpawn(playerTeam === TeamEnum.Defender));
            HotbarManager.sendHotbar(player);
        }
    }
}