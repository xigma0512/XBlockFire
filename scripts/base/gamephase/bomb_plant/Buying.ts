import { GameRoomManager } from "../../gameroom/GameRoom";
import { ActionPhase } from "./Action";
import { MapRegister } from "../../gamemap/MapRegister";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action";
import { HotbarManager } from "../../../modules/hotbar/Hotbar";

import { Config } from "./_config";
import { TeamEnum } from "../../../types/TeamEnum";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../../utils/Property";

import { GameMode, InputPermissionCategory, ItemStack } from "@minecraft/server";

const config = Config.buying;

export class BuyingPhase implements IPhaseHandler {

    readonly hud: ActionHud;
    readonly phaseTag = BombPlantPhaseEnum.Buying;

    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) {        
        this.hud = new ActionHud(roomId);
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        spawnPlayers(this.roomId);
        sendHotbar(this.roomId);
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
            HotbarManager.instance.getHotbar(player).set(8, undefined);
            HotbarManager.instance.sendHotbar(player);
        }
        
        console.warn(`[Room ${this.roomId}] Exit BP:buying phase.`);
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        if (this.currentTick <= 0) room.phaseManager.updatePhase(new ActionPhase(this.roomId));
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
        HotbarManager.instance.getHotbar(player).set(8, new ItemStack('minecraft:feather'));
        HotbarManager.instance.sendHotbar(player);
    }
}

function sendHotbar(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const member = room.memberManager;

    for (const player of member.getPlayers()) {
        HotbarManager.instance.getHotbar(player).set(8, new ItemStack('minecraft:feather'));
        HotbarManager.instance.sendHotbar(player);
    }

    const attackers = member.getPlayers({ team: TeamEnum.Attacker });
    const bombPlayer = attackers[Math.floor(Math.random() * attackers.length)];
    HotbarManager.instance.getHotbar(bombPlayer).set(3, new ItemStack('xblockfire:c4'));
    HotbarManager.instance.sendHotbar(bombPlayer);
}

function resetPlayers(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const players = room.memberManager.getPlayers();
    for (const player of players) {
        set_entity_dynamic_property(player, 'player:is_alive', true);
        player.setGameMode(GameMode.Adventure);
    }
}