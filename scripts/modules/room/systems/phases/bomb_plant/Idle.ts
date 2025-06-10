import { GameRoomManager } from "../../GameRoom";
import { BombPlant_BuyingPhase } from "./Buying";

import { Broadcast } from "../../../../../utils/Broadcast";
import { ColorTable, ColorType } from "../../../../../utils/Color";
import { set_entity_dynamic_property } from "../../../../../utils/Property";
import { TeamTagEnum } from "../../../../weapon/types/Enums";

const AUTO_START = true;
const AUTO_START_MIN_PLAYER = 2;
const COUNTDOWN_TIME = 30 * 20;

export class BombPlant_IdlePhase implements IPhaseHandler {

    private currentTick: number = COUNTDOWN_TIME;

    constructor(private readonly roomId: number) { }

    on_entry() {
        this.currentTick = COUNTDOWN_TIME;
        console.warn('Entry BombPlant:idle phase.');
    }

    on_running() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const members = room.memberManager.getPlayers();
        const playerAmount = members.length;

        let actionbarText = `${ColorTable[ColorType.Yellow]}Waiting for more players...`;

        if (AUTO_START && playerAmount >= AUTO_START_MIN_PLAYER) {
            actionbarText = `${ColorTable[ColorType.Green]}Game will start in ${(this.currentTick / 20).toFixed(0)} seconds.`;
            this.currentTick --;
        }

        if (this.currentTick !== COUNTDOWN_TIME && playerAmount < AUTO_START_MIN_PLAYER) {
            this.currentTick = COUNTDOWN_TIME;
            Broadcast.message(`${ColorTable[ColorType.Red]}Not enough players. Waiting for more players.`, members);
        }

        Broadcast.actionbar(actionbarText, members);
        this.transitions();
    }

    on_exit() {
        if (AUTO_START) balanceTeam(this.roomId);
        initializePlayers(this.roomId);
        console.warn('Exit BombPlant:idle phase.');
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);

        if (this.currentTick <= 0) return room.phaseManager.updatePhase(new BombPlant_BuyingPhase(this.roomId));
    }

}

function balanceTeam(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();
    
    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());

    let attackTeamCount = 0;
    let defenderTeamCount = 0;
    for (const player of shuffledPlayers) {
        if (attackTeamCount <= defenderTeamCount) {
            set_entity_dynamic_property(player, 'player:team', TeamTagEnum.Attacker);
            attackTeamCount++;
            player.sendMessage('You have been assigned to the Attacker Team.');
        } else {
            set_entity_dynamic_property(player, 'player:team', TeamTagEnum.Defender);
            defenderTeamCount++;
            player.sendMessage('You have been assigned to the Defender Team.');
        }
    }
}

function initializePlayers(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();

    for (const player of players) {
        room.economyManager.initializePlayer(player);
    }
}