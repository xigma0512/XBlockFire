import { BombStateManager } from "../fsm/bombstate/BombStateManager";
import { C4DroppedState } from "../fsm/bombstate/states/Dropped";
import { MemberManager } from "./MemberManager";
import { EconomyManager } from "../economy/EconomyManager";

import { HudTextController } from "../../interface/hud/HudTextController";

import { gameEvents } from "../../infrastructure/event/EventEmitter";
import { Broadcast } from "../../infrastructure/utils/Broadcast";
import { set_entity_dynamic_property } from "../../infrastructure/data/Property";
import { set_variable, variable } from "../../infrastructure/data/Variable";
import { lang } from "../../infrastructure/Language";

import { FormatCode as FC } from "../../declarations/enum/FormatCode"
import { TeamEnum } from "../../declarations/enum/TeamEnum";

import { GameMode } from "@minecraft/server";
import { ItemStack, Player, system, world } from "@minecraft/server";

const deathPlayers = new Set<Player>();

world.afterEvents.entityDie.subscribe(ev => {
    if (!(ev.deadEntity instanceof Player)) return;
    const deadPlayer = ev.deadEntity;
    const source = ev.damageSource;
    const attacker = source.damagingEntity;
    system.runTimeout(() => gameEvents.emit('playerDied', { deadPlayer, attacker }), 5);
})

gameEvents.subscribe('playerDied', (ev) => {
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
        ev.attacker.sendMessage(lang('combat.player.kill_reward'));
    }
});


const C4_ITEM_ID = 'xblockfire:c4';
function dropC4(player: Player) {
    const container = player.getComponent('inventory')!.container!;
    if (container.find(new ItemStack(C4_ITEM_ID)) === undefined) return;

    BombStateManager.updateState(new C4DroppedState(player.location));
}

function showDeathMessage(deadPlayer: Player, attacker: Player) {

    const deadPlayerTeam = MemberManager.getPlayerTeam(deadPlayer);
    const attackerTeam = MemberManager.getPlayerTeam(attacker);

    const playerTeamStr = (team: TeamEnum, name: string) => (team === TeamEnum.Attacker) ? `${FC.Red}[A]${name}` : `${FC.Aqua}[D]${name}`;
    
    Broadcast.message(lang(
        'combat.broadcast.eliminated', 
        playerTeamStr(attackerTeam, attacker.name), 
        playerTeamStr(deadPlayerTeam, deadPlayer.name)
    ));
    
    const taskId = system.runInterval(() => {
        HudTextController.add(attacker, 'subtitle', lang('combat.player.killer.subtitle', deadPlayer.name));
        HudTextController.add(deadPlayer, 'subtitle', lang('combat.player.dead_player.subtitle', attacker.name));
    });
    system.runTimeout(() => {
        system.clearRun(taskId);
    }, 5 * 20);
}