import { MemberManager } from "../../base/member/MemberManager";
import { C4Manager } from "../../base/c4state/C4Manager";
import { gameEvents } from "../../event/EventEmitter";
import { HudTextController } from "../hud/HudTextController";

import { C4DroppedState } from "../../base/c4state/states/Dropped";

import { TeamEnum } from "../../types/TeamEnum";

import { Broadcast } from "../../utils/Broadcast";
import { FormatCode as FC } from "../../utils/FormatCode";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../utils/Property";
import { set_variable, variable } from "../../utils/Variable";

import { GameMode } from "@minecraft/server";
import { ItemStack, Player, system, world } from "@minecraft/server";

const deathPlayers = new Set<Player>();

world.afterEvents.entityDie.subscribe(ev => {
    if (!(ev.deadEntity instanceof Player) || !MemberManager.includePlayer(ev.deadEntity)) return;
    const deadPlayer = ev.deadEntity;
    const source = ev.damageSource;
    const attacker = source.damagingEntity;
    system.runTimeout(() => gameEvents.emit('playerDied', { deadPlayer, attacker }), 5);
})

gameEvents.subscribe('playerDied', (ev) => {
    if (!MemberManager.includePlayer(ev.deadPlayer)) return;

    if (deathPlayers.has(ev.deadPlayer)) return;
    
    deathPlayers.add(ev.deadPlayer);
    system.runTimeout(() => {
        deathPlayers.delete(ev.deadPlayer);
    }, 20);

    const deadPlayer = ev.deadPlayer;
    dropC4(deadPlayer);
    set_entity_dynamic_property(deadPlayer, 'player:is_alive', false);
    deadPlayer.getComponent('inventory')?.container.clearAll();
    deadPlayer.setGameMode(GameMode.Spectator);

    set_variable(`${deadPlayer.name}.deaths`, variable(`${deadPlayer.name}.deaths`) + 1);
    
    if (ev.attacker && ev.attacker instanceof Player) {
        showDeathMessage(deadPlayer, ev.attacker);
        set_variable(`${ev.attacker.name}.kills`, variable(`${ev.attacker.name}.kills`) + 1);
    }
});


const C4_ITEM_ID = 'xblockfire:c4';
function dropC4(player: Player) {
    const container = player.getComponent('inventory')!.container!;
    if (container.find(new ItemStack(C4_ITEM_ID)) === undefined) return;

    C4Manager.updateState(new C4DroppedState(player.location));
}

function showDeathMessage(deadPlayer: Player, attacker: Player) {

    const deadPlayerTeam = entity_dynamic_property(deadPlayer, 'player:team');
    const attackerTeam = entity_dynamic_property(attacker, 'player:team');

    const playerTeamStr = (team: TeamEnum, name: string) => (team === TeamEnum.Attacker) ? `${FC.Red}[A]${name}` : `${FC.Aqua}[D]${name}`;
    
    Broadcast.message(
        `${FC.Bold}${playerTeamStr(attackerTeam, attacker.name)} ${FC.DarkRed}eliminated ${playerTeamStr(deadPlayerTeam, deadPlayer.name)}`,
        MemberManager.getPlayers()
    );
    
    const taskId = system.runInterval(() => {
        HudTextController.add(attacker, 'subtitle', `${FC.Bold}\uE109${FC.DarkRed}${deadPlayer.name}`);
        HudTextController.add(deadPlayer, 'subtitle', `${FC.Bold}${FC.Red}${attacker.name} KILLED YOU`);
    });
    system.runTimeout(() => {
        system.clearRun(taskId);
    }, 4 * 20);
}