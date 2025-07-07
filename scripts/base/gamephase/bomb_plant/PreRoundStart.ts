import { GameRoomManager } from "../../gameroom/GameRoom";
import { HotbarManager, HotbarTemplate } from "../../../modules/hotbar/Hotbar";
import { MapRegister } from "../../gamemap/MapRegister";
import { BuyingPhase } from "./Buying";
import { BombIdleState } from "../../bombstate/states/Idle";

import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";
import { TeamEnum } from "../../../types/TeamEnum";

import { entity_dynamic_property, set_entity_dynamic_property, set_entity_native_property } from "../../../utils/Property";
import { ItemStackFactory } from "../../../utils/ItemStackFactory";

import { GameMode, InputPermissionCategory, ItemLockMode } from "@minecraft/server";
import { ItemStack } from "@minecraft/server";

export class PreRoundStartPhase implements IPhaseHandler {
    readonly phaseTag = BombPlantPhaseEnum.PreRoundStart;
    readonly hud!: InGameHud;
    readonly currentTick: number = -1;

    constructor(private readonly roomId: number) {}

    on_entry() {
        resetBombState(this.roomId);
        teleportPlayers(this.roomId);
        resetPlayerInventory(this.roomId);
        initializePlayers(this.roomId);
        console.warn(`[Room ${this.roomId}] Entry BP:pre_round_start phase.`);
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

function resetBombState(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const bombManager = room.bombManager;
    bombManager.updateState(new BombIdleState(roomId));
}

function initializePlayers(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const member = room.memberManager;

    for (const player of member.getPlayers()) {
        if (entity_dynamic_property(player, 'player:is_spectator')) continue;

        player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, false); 
        set_entity_dynamic_property(player, 'player:is_alive', true);
        set_entity_native_property(player, 'player:can_use_item', false);
        player.setGameMode(GameMode.Adventure);
        player.addEffect('regeneration', 100, { amplifier: 255 });
        
        player.removeTag('attacker');
        player.removeTag('defender');
        player.addTag(entity_dynamic_property(player, 'player:team') === TeamEnum.Attacker ? 'attacker' : 'defender');
    }
}

function teleportPlayers(roomId: number) {
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

        const playerTeam = entity_dynamic_property(player, 'player:team');
        const playerTeamSpawns = spawns[playerTeam];
        const spawnIndex = nextSpawnIndex[playerTeam]++ % playerTeamSpawns.length;
        player.teleport(playerTeamSpawns[spawnIndex]);
    }
}

function resetPlayerInventory(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const member = room.memberManager;
    
    for (const player of member.getPlayers()) {
        // eslint-disable-next-line
        player.runCommand('clear @s xblockfire:c4');

        if (!entity_dynamic_property(player, 'player:is_alive')) {
            HotbarManager.sendHotbar(player, HotbarTemplate.initSpawn());
        } else {
            const hotbar = HotbarManager.getPlayerHotbar(player);
            HotbarManager.resetItems(hotbar);
            HotbarManager.sendHotbar(player, hotbar);
        }
    }

    for (const player of member.getPlayers({team: TeamEnum.Defender})) {
        const hotbar = HotbarManager.getPlayerHotbar(player)
        hotbar.items[3] = ItemStackFactory.new({ typeId: 'xblockfire:defuser', lockMode: ItemLockMode.slot });
        HotbarManager.sendHotbar(player, hotbar);
    }

    const attackers = member.getPlayers({ team: TeamEnum.Attacker });
    if (attackers.length > 0) {
        const bombPlayer = attackers[Math.floor(Math.random() * attackers.length)];

        const hotbar = HotbarManager.getPlayerHotbar(bombPlayer)
        hotbar.items[3] = new ItemStack('xblockfire:c4');
        HotbarManager.sendHotbar(bombPlayer, hotbar);
    }
}