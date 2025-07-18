import { MemberManager } from "../../base/gameroom/member/MemberManager";
import { C4Manager } from "../../base/c4state/C4Manager";
import { gameEvents } from "../../event/EventEmitter";
import { HudTextController } from "../hud/HudTextController";

import { C4DroppedState } from "../../base/c4state/states/Dropped";

import { TeamEnum } from "../../types/TeamEnum";

import { Broadcast } from "../../utils/Broadcast";
import { FormatCode as FC } from "../../utils/FormatCode";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../utils/Property";

import { GameMode } from "@minecraft/server";
import { ItemStack, Player, system, world } from "@minecraft/server";

world.afterEvents.entityDie.subscribe(ev => {
    if (!(ev.deadEntity instanceof Player) || !MemberManager.includePlayer(ev.deadEntity)) return;
    const deadPlayer = ev.deadEntity;
    const source = ev.damageSource;
    const attacker = source.damagingEntity;
    system.runTimeout(() => gameEvents.emit('playerDied', { deadPlayer, attacker }), 3);
})

gameEvents.subscribe('playerDied', (ev) => {
    if (!MemberManager.includePlayer(ev.deadPlayer)) return;
    const deadPlayer = ev.deadPlayer;
    dropC4(deadPlayer);
    set_entity_dynamic_property(deadPlayer, 'player:is_alive', false);
    deadPlayer.getComponent('inventory')?.container.clearAll();
    deadPlayer.setGameMode(GameMode.Spectator);

    if (ev.attacker && ev.attacker instanceof Player) showDeathMessage(deadPlayer, ev.attacker);
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
    });
    system.runTimeout(() => {
        system.clearRun(taskId);
    }, 3 * 20);
}