import { GameRoomManager } from "../../gameroom/GameRoom";
import { HotbarManager } from "../../../modules/hotbar/Hotbar";
import { MapRegister } from "../../gamemap/MapRegister";
import { BuyingPhase } from "./Buying";

import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";
import { TeamEnum } from "../../../types/TeamEnum";
import { entity_dynamic_property, set_entity_dynamic_property, set_entity_native_property } from "../../../utils/Property";

import { GameMode, InputPermissionCategory, ItemStack } from "@minecraft/server";


export class PreRoundStartPhase implements IPhaseHandler {
    readonly phaseTag = BombPlantPhaseEnum.PreRoundStart;
    readonly hud!: InGameHud;
    readonly currentTick: number = -1;

    constructor(private readonly roomId: number) {}

    on_entry() {
        console.warn(`[Room ${this.roomId}] Entry BP:pre_round_start phase.`);
        initializePlayers(this.roomId);
    }

    on_running() {
        this.transitions();
    }

    on_exit() {
        console.warn(`[Room ${this.roomId}] Exit BP:pre_round_start phase.`);
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        room.phaseManager.updatePhase(new BuyingPhase(this.roomId));
    }
}

function initializePlayers(roomId: number) {
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
        if (entity_dynamic_property(player, 'player:is_spectator')) continue;

        // teleport
        const playerTeam = entity_dynamic_property(player, 'player:team');
        const playerTeamSpawns = spawns[playerTeam];
        const spawnIndex = nextSpawnIndex[playerTeam]++ % playerTeamSpawns.length;
        player.teleport(playerTeamSpawns[spawnIndex]);
        
        // player initial setting
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, false); 
        set_entity_dynamic_property(player, 'player:is_alive', true);
        set_entity_native_property(player, 'player:can_use_item', false);
        player.setGameMode(GameMode.Adventure);
        player.addEffect('regeneration', 100, { amplifier: 255 });
        
    }

    // send c4
    const attackers = member.getPlayers({ team: TeamEnum.Attacker });
    if (attackers.length > 0) {
        const bombPlayer = attackers[Math.floor(Math.random() * attackers.length)];

        const hotbar = HotbarManager.getPlayerHotbar(bombPlayer)
        hotbar.items[3] = new ItemStack('xblockfire:c4');
        HotbarManager.sendHotbar(bombPlayer, hotbar);
    }
}