import { MemberManager } from './MemberManager';
import { C4Manager } from '../core/gamemodes/BombPlant/c4state/C4Manager';
import { gameEvents } from '../../event/EventEmitter';

import { C4DroppedState } from '../core/gamemodes/BombPlant/c4state/states/Dropped';

import { TeamEnum } from './TeamEnum';

import { HudDriver } from '../../ui/hud/drivers/HudDriver';
import { Sound } from '../../ui/media/Sound';
import { Language as L } from '../../utils/Language';
import { FormatCode as FC } from '../../utils/FormatCode';
import { set_entity_dynamic_property } from '../../utils/Property';
import { set_variable, variable } from '../../utils/Variable';

import { GameMode } from '@minecraft/server';
import { ItemStack, Player, system, world } from '@minecraft/server';

import { gameroom } from '../core/GameRoom';
import { GameModeEnum } from '../core/GameModeEnum';
import { PhaseIdentity } from '../core/gamephase/PhaseIdentity';
import { PhaseManager } from '../core/gamephase/PhaseManager';
import { DeathmatchActionPhase } from '../core/gamemodes/Deathmatch/phases/Action';

const deathPlayers = new Set<Player>();

world.afterEvents.entityDie.subscribe((ev) => {
    if (!(ev.deadEntity instanceof Player) || !MemberManager.includePlayer(ev.deadEntity)) return;
    const deadPlayer = ev.deadEntity;
    const source = ev.damageSource;
    const attacker = source.damagingEntity;
    system.runTimeout(() => gameEvents.emit('playerDied', { deadPlayer, attacker }), 5);
});

gameEvents.subscribe('playerDied', (ev: any) => {
    if (!MemberManager.includePlayer(ev.deadPlayer)) return;
    if (deathPlayers.has(ev.deadPlayer)) return;

    deathPlayers.add(ev.deadPlayer);
    system.runTimeout(() => {
        deathPlayers.delete(ev.deadPlayer);
    }, 20);

    const deadPlayer = ev.deadPlayer as Player;
    const attacker = ev.attacker instanceof Player ? ev.attacker : undefined;

    set_entity_dynamic_property(deadPlayer, 'player:is_alive', false);
    set_variable(`${deadPlayer.name}.deaths`, (variable(`${deadPlayer.name}.deaths`) || 0) + 1);

    if (attacker && attacker !== deadPlayer) {
        showDeathMessage(deadPlayer, attacker);
        set_variable(`${attacker.name}.kills`, (variable(`${attacker.name}.kills`) || 0) + 1);
    }

    if (gameroom().gameMode === GameModeEnum.Deathmatch) {
        handleDeathmatchDeath(deadPlayer, attacker);
        return;
    }

    handleBombPlantDeath(deadPlayer);
});

function handleBombPlantDeath(deadPlayer: Player) {
    dropC4(deadPlayer);
    deadPlayer.getComponent('inventory')?.container.clearAll();
    deadPlayer.setGameMode(GameMode.Spectator);
}

function handleDeathmatchDeath(deadPlayer: Player, attacker: Player | undefined) {
    deadPlayer.getComponent('inventory')?.container.clearAll();
    deadPlayer.setGameMode(GameMode.Spectator);

    if (attacker && MemberManager.getPlayerTeam(attacker) !== MemberManager.getPlayerTeam(deadPlayer)) {
        const attackerTeam = MemberManager.getPlayerTeam(attacker);
        if (attackerTeam === TeamEnum.Attacker) {
            set_variable('attacker_score', (variable('attacker_score') || 0) + 1);
        } else if (attackerTeam === TeamEnum.Defender) {
            set_variable('defender_score', (variable('defender_score') || 0) + 1);
        }
    }

    const phase = PhaseManager.getPhase();
    if (phase.phaseId === PhaseIdentity.Deathmatch.Action) {
        (phase as DeathmatchActionPhase).queueRespawn(deadPlayer);
    }
}

const C4_ITEM_ID = 'xblockfire:c4';
function dropC4(player: Player) {
    const container = player.getComponent('inventory')!.container!;
    if (container.find(new ItemStack(C4_ITEM_ID)) === undefined) return;

    C4Manager.updateState(new C4DroppedState(player.location));
}

function showDeathMessage(deadPlayer: Player, attacker: Player) {
    const deadPlayerTeam = MemberManager.getPlayerTeam(deadPlayer);
    const attackerTeam = MemberManager.getPlayerTeam(attacker);

    const teamPrefix = (team: TeamEnum) => (team === TeamEnum.Attacker ? `${FC.Red}[A]` : `${FC.Aqua}[D]`);

    HudDriver.chat(
        FC.Bold +
            L.translate(
                'game.player_eliminated',
                teamPrefix(attackerTeam),
                attacker.name,
                teamPrefix(deadPlayerTeam),
                deadPlayer.name
            )
    );

    // Using fire-and-forget with 4 seconds duration
    HudDriver.pushSubtitle(attacker, FC.Bold + `\uE109${FC.DarkRed}${deadPlayer.name}`, 4 * 20);
    HudDriver.pushSubtitle(deadPlayer, FC.Bold + `${FC.Red}${L.translate('game.killed_you', attacker.name)}`, 4 * 20);
    Sound.play('PLAYER_KILL', attacker);
    Sound.play('PLAYER_DEATH', deadPlayer);
}
