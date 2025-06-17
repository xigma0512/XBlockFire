import { GameRoomManager } from "../../GameRoom";
import { BP_ActionPhase } from "./Action";
import { MapRegister } from "../../map/MapRegister";

import { BP_PhaseEnum } from "./PhaseEnum";
import { TeamTagEnum } from "../../../../weapon/types/Enums";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../../../../utils/Property";
import { Broadcast } from "../../../../../utils/Broadcast";

import { GameMode, InputPermissionCategory } from "@minecraft/server";
import { Vector3Utils } from "@minecraft/math";

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
        const room = GameRoomManager.instance.getRoom(this.roomId);
        const members = room.memberManager.getPlayers();

        let actionbarText = [
            `Buying phase will end in ${(this.currentTick / 20).toFixed(0)} seconds.\n`, 
            `Right-click the feather to open the shop.`
        ];
        
        Broadcast.actionbar(actionbarText, members);
        this._currentTick --;

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

    const attackerSpawns = gameMap.positions.attacker_spawns;
    const defenderSpawns = gameMap.positions.defender_spawns;

    const spawns = {
        [TeamTagEnum.Attacker]: attackerSpawns,
        [TeamTagEnum.Defender]: defenderSpawns,
    }

    let nextSpawnIndex = new Array<number>(10).fill(0);

    for (const player of member.getPlayers()) {
        const playerTeam = entity_dynamic_property(player, 'player:team');
        if (playerTeam === TeamTagEnum.Spectator) continue;

        const playerTeamSpawns = spawns[playerTeam];
        const spawnIndex = nextSpawnIndex[playerTeam]++ % playerTeamSpawns.length;
        
        player.teleport(Vector3Utils.add(playerTeamSpawns[spawnIndex], {x: 0.5, z: 0.5}));
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, false);
    }
}

function resetPlayers(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();
    for (const player of players) {
        set_entity_dynamic_property(player, 'player:is_alive', true);
        player.setGameMode(GameMode.adventure);
    }
}