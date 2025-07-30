import { EquipmentSlot, GameMode, InputPermissionCategory, system } from "@minecraft/server";

import { HotbarService } from "../../../../application/services/HotbarService";

import { gameroom } from "../../../gameroom/GameRoom";
import { GamePhaseManager } from "../GamePhaseManager";
import { MemberManager } from "../../../player/MemberManager";
import { BombStateManager } from "../../bombstate/BombStateManager";
import { MapRegister } from "../../../gameroom/MapRegister";
import { UnCommonItems } from "../../../player/UnCommonItems";
import { C4IdleState } from "../../bombstate/states/Idle";
import { BuyingPhase } from "./Buying";

import { entity_dynamic_property, set_entity_dynamic_property, set_entity_native_property } from "../../../../infrastructure/data/Property";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

export class PreRoundStartPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.PreRoundStart;

    constructor() {}

    on_entry() {
        resetbombstate();
        teleportPlayers();
        resetPlayerInventory();
        initializePlayers();
    }

    on_running() {
    }

    on_exit() {
    }

    transitions() {
        GamePhaseManager.updatePhase(new BuyingPhase());
    }
}

function resetbombstate() {
    BombStateManager.updateState(new C4IdleState());
}

function initializePlayers() {
    for (const player of MemberManager.getPlayers()) {

        if (MemberManager.getPlayerTeam(player) === TeamEnum.Spectator) {
            player.setGameMode(GameMode.Spectator);
            continue;
        }

        player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, false); 
        
        set_entity_dynamic_property(player, 'player:is_alive', true);
        set_entity_native_property(player, 'player:can_use_item', false);

        player.setGameMode(GameMode.Adventure);

        player.addEffect('regeneration', 400, { amplifier: 255 });
        player.addEffect('health_boost', 20000000, { amplifier: 4, showParticles: false });
        player.addEffect('hunger', 100, { amplifier: 255, showParticles: false });

        system.runTimeout(() => {
            player.addEffect('saturation', 1, { amplifier: 5, showParticles: false });
        }, 120);
        
        player.removeTag('attacker');
        player.removeTag('defender');
        player.addTag(MemberManager.getPlayerTeam(player) === TeamEnum.Attacker ? 'attacker' : 'defender');
    }
}

function teleportPlayers() {
    const gameMap = MapRegister.getMap(gameroom().gameMapId);

    let nextSpawnIndex = {
        [TeamEnum.Attacker]: 0,
        [TeamEnum.Defender]: 0,
        [TeamEnum.Spectator]: 0
    }

    for (const player of MemberManager.getPlayers()) {
        const playerTeam = MemberManager.getPlayerTeam(player);
        const playerTeamSpawns = gameMap.positions.spawns[playerTeam];
        const spawnIndex = nextSpawnIndex[playerTeam]++ % playerTeamSpawns.length;
        player.teleport(playerTeamSpawns[spawnIndex]);
    }
}

function resetPlayerInventory() {
    for (const player of MemberManager.getPlayers()) {
        // eslint-disable-next-line
        player.runCommand('clear @s xblockfire:c4');

        if (!entity_dynamic_property(player, 'player:is_alive')) {
            HotbarService.clearHotbar(player);
            HotbarService.sendDefaultKit(player);
        } else {
            HotbarService.reloadHotbar(player);
        }
    }

    for (const player of MemberManager.getPlayers({team: TeamEnum.Defender})) {
        HotbarService.sendDefuserKit(player);
    }

    const attackers = MemberManager.getPlayers({ team: TeamEnum.Attacker });
    if (attackers.length > 0) {
        const c4Player = attackers[Math.floor(Math.random() * attackers.length)];
        HotbarService.sendC4Kit(c4Player);
    }

    const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });
    for (const player of attackers) {
        const equippable = player.getComponent('equippable')!;
        equippable.setEquipment(EquipmentSlot.Head, UnCommonItems.getItem('attacker_helmet'));
        equippable.setEquipment(EquipmentSlot.Chest, UnCommonItems.getItem('attacker_chestplate'));
        equippable.setEquipment(EquipmentSlot.Legs, UnCommonItems.getItem('attacker_leggings'));
        equippable.setEquipment(EquipmentSlot.Feet, UnCommonItems.getItem('attacker_boots'));
    }

    for (const player of defenders) {
        const equippable = player.getComponent('equippable')!;
        equippable.setEquipment(EquipmentSlot.Head, UnCommonItems.getItem('defender_helmet'));
        equippable.setEquipment(EquipmentSlot.Chest, UnCommonItems.getItem('defender_chestplate'));
        equippable.setEquipment(EquipmentSlot.Legs, UnCommonItems.getItem('defender_leggings'));
        equippable.setEquipment(EquipmentSlot.Feet, UnCommonItems.getItem('defender_boots'));
    }
}