import { MemberManager } from "../../base/member/MemberManager";
import { C4Manager } from "../../base/c4state/C4Manager";
import { gameEvents } from "../../event/EventEmitter";
import { EconomyManager } from "../../base/economy/EconomyManager";

import { C4DroppedState } from "../../base/c4state/states/Dropped";

import { TeamEnum } from "../../types/TeamEnum";

import { MessageManager as Msg } from "../hud/MessageManager";
import { FormatCode as FC } from "../../utils/FormatCode";
import { set_entity_dynamic_property } from "../../utils/Property";
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

        EconomyManager.setMoney(ev.attacker, EconomyManager.getMoney(ev.attacker) + 200);
        ev.attacker.sendMessage(Msg.translateWithPrefix("kill.reward", 200));
    }
});


const C4_ITEM_ID = 'xblockfire:c4';
function dropC4(player: Player) {
    const container = player.getComponent('inventory')!.container!;
    if (container.find(new ItemStack(C4_ITEM_ID)) === undefined) return;

    C4Manager.updateState(new C4DroppedState(player.location));
}

function showDeathMessage(deadPlayer: Player, attacker: Player) {

    const deadPlayerTeam = MemberManager.getPlayerTeam(deadPlayer);
    const attackerTeam = MemberManager.getPlayerTeam(attacker);

    const teamPrefix = (team: TeamEnum) => (team === TeamEnum.Attacker) ? `${FC.Red}[A]` : `${FC.Aqua}[D]`;
    
    Msg.message(
        "game.player_eliminated",
        undefined,
        teamPrefix(attackerTeam), attacker.name, teamPrefix(deadPlayerTeam), deadPlayer.name
    );
    
    const taskId = system.runInterval(() => {
        Msg.rawSubtitle(`${FC.Bold}\uE109${FC.DarkRed}${deadPlayer.name}`, attacker);
        Msg.subtitle("game.killed_you", deadPlayer, attacker.name);
    });
    system.runTimeout(() => {
        system.clearRun(taskId);
    }, 4 * 20);
}
