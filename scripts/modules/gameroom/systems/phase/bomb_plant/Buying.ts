import { GameRoomManager } from "../../GameRoom";
import { BP_ActionPhase } from "./Action";
import { MapRegister } from "../../map/MapRegister";

import { TeamEnum } from "../../../types/TeamEnum";
import { BP_PhaseEnum } from "../../../types/PhaseEnum";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../../../../utils/Property";
import { Broadcast } from "../../../../../utils/Broadcast";
import { variable } from "../../../../../utils/Variable";
import { FormatCode } from "../../../../../utils/FormatCode";

import { GameMode, InputPermissionCategory } from "@minecraft/server";

const COUNTDOWN_TIME = 30 * 20;

export class BP_BuyingPhase implements IPhaseHandler {

    readonly phaseTag = BP_PhaseEnum.Buying;
    private _currentTick: number = COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) { }

    on_entry() {
        this._currentTick = COUNTDOWN_TIME;
        spawnPlayers(this.roomId);
        resetPlayers(this.roomId);

        console.warn(`[Room ${this.roomId}] Entry BP:buying phase.`);
    }

    on_running() {
        this._currentTick --;
        updateActionbar(this.roomId, this.currentTick);
        updateTopbar(this.roomId, this.currentTick);
        updateSidebar(this.roomId);
        this.transitions();
    }

    on_exit() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const member = room.memberManager;

        for (const player of member.getPlayers()) {
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, true);
        }
        
        console.warn(`[Room ${this.roomId}] Exit BP:buying phase.`);
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        if (this.currentTick <= 0) room.phaseManager.updatePhase(new BP_ActionPhase(this.roomId));
    }

}

function spawnPlayers(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const member = room.memberManager;
    const gameMap = MapRegister.instance.getMap(room.gameMapId);

    const spawns = {
        [TeamEnum.Attacker]: gameMap.positions.attacker_spawns,
        [TeamEnum.Defender]: gameMap.positions.defender_spawns,
    }

    let nextSpawnIndex = {
        [TeamEnum.Attacker]: 0,
        [TeamEnum.Defender]: 0
    }

    for (const player of member.getPlayers()) {
        const playerTeam = entity_dynamic_property(player, 'player:team');
        if (entity_dynamic_property(player, 'player:is_spectator')) continue;

        const playerTeamSpawns = spawns[playerTeam];
        const spawnIndex = nextSpawnIndex[playerTeam]++ % playerTeamSpawns.length;
        
        player.teleport(playerTeamSpawns[spawnIndex]);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, false);
    }
}

function resetPlayers(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();
    for (const player of players) {
        set_entity_dynamic_property(player, 'player:is_alive', true);
        player.setGameMode(GameMode.Adventure);
    }
}

function updateActionbar(roomId: number, currentTick: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const members = room.memberManager.getPlayers();

    let actionbarText = [
        `Buying phase will end in ${(currentTick / 20).toFixed(0)} seconds.\n`, 
        `Right-click the feather to open the shop.`
    ];
    
    Broadcast.actionbar(actionbarText, members);
}

function updateSidebar(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();

    for (const player of players) {
        const playerTeam = entity_dynamic_property(player, 'player:team') as TeamEnum;
        const teamStr = 
            (playerTeam === TeamEnum.Attacker) ? `${FormatCode.Red}Attacker` :
            (playerTeam === TeamEnum.Defender) ? `${FormatCode.Aqua}Defender` :
                                                    `${FormatCode.Gray}Spectator` 

        const sidebarMessage = [
            `Money: ${FormatCode.Green}${room.economyManager.getMoney(player)}`,
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
            `[ ${FormatCode.Green}${allies.map(p => p.name.substring(0, 3)).join(' ')}${FormatCode.Reset} ] VS [ ${FormatCode.Red}${enemies.map(p => p.name.substring(0, 3)).join(' ')}${FormatCode.Reset} ]`
        ];

        Broadcast.topbar(topbarMessage, [player]);
    }
}