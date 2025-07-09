import { BombDroppedState } from "../../base/bombstate/states/Dropped";
import { GameRoomManager } from "../../base/gameroom/GameRoom";
import { MemberManager } from "../../base/gameroom/member/MemberManager";
import { gameEvents } from "../../event/EventEmitter";

import { TeamEnum } from "../../types/TeamEnum";

import { Broadcast } from "../../utils/Broadcast";
import { FormatCode as FC } from "../../utils/FormatCode";
import { entity_dynamic_property, set_entity_dynamic_property } from "../../utils/Property";

import { GameMode, ItemStack, Player, system, world } from "@minecraft/server";

world.afterEvents.entityDie.subscribe(ev => {
    if (!(ev.deadEntity instanceof Player) || !MemberManager.isInRoom(ev.deadEntity)) return;
    const deadPlayer = ev.deadEntity;
    const source = ev.damageSource;
    const attacker = source.damagingEntity;
    system.runTimeout(() => gameEvents.emit('playerDied', { deadPlayer, attacker }), 3);
})

gameEvents.subscribe('playerDied', (ev) => {
    if (!MemberManager.isInRoom(ev.deadPlayer)) return;
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

    const roomId = MemberManager.getPlayerRoomId(player)!;
    const room = GameRoomManager.getRoom(roomId);
    const bombManager = room.bombManager;
    bombManager.updateState(new BombDroppedState(roomId, player.location));
}

function showDeathMessage(deadPlayer: Player, attacker: Player) {
    const roomId = MemberManager.getPlayerRoomId(deadPlayer)!;
    const room = GameRoomManager.getRoom(roomId);

    const deadPlayerTeam = entity_dynamic_property(deadPlayer, 'player:team');
    const attackerTeam = entity_dynamic_property(attacker, 'player:team');

    const playerTeamStr = (team: TeamEnum, name: string) => (team === TeamEnum.Attacker) ? `${FC.Red}[A]${name}` : `${FC.Aqua}[D]${name}`;
    
    Broadcast.message(
        `${FC.Bold}${playerTeamStr(attackerTeam, attacker.name)} ${FC.DarkRed}eliminated ${playerTeamStr(deadPlayerTeam, deadPlayer.name)}`,
        room.memberManager.getPlayers()
    );
}