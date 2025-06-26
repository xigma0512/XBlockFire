import { GameRoomManager } from "../../GameRoom";
import { BP_ActionPhase } from "./Action";
import { MapRegister } from "../../map/MapRegister";
import { BP_ActionHud } from "../../../../hud/bomb_plant/Action";

import { BP_Config } from "./_config";
import { TeamEnum } from "../../../types/TeamEnum";
import { BP_PhaseEnum } from "../../../types/PhaseEnum";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../../../../utils/Property";

import { GameMode, InputPermissionCategory } from "@minecraft/server";

const config = BP_Config.buying;

export class BP_BuyingPhase implements IPhaseHandler {

    readonly hud: BP_ActionHud;
    readonly phaseTag = BP_PhaseEnum.Buying;

    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) {        
        this.hud = new BP_ActionHud(roomId);
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        spawnPlayers(this.roomId);
        resetPlayers(this.roomId);

        console.warn(`[Room ${this.roomId}] Entry BP:buying phase.`);
    }

    on_running() {
        this._currentTick --;
        this.hud.update();
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