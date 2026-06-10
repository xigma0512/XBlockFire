import { gameEvents } from '../../event/EventEmitter';
import { MemberManager } from './MemberManager';

import { TeamEnum } from './TeamEnum';

import { HudDriver } from '../../ui/hud/drivers/HudDriver';
import { Sound } from '../../ui/media/Sound';
import { FormatCode as FC } from '../../utils/FormatCode';
import { Language as L } from '../../utils/Language';
import { set_entity_dynamic_property } from '../../utils/Property';
import { set_variable, variable } from '../../utils/Variable';

import { Player, system, world } from '@minecraft/server';

import { gameroom } from '../core/GameRoom';

const deathPlayers = new Set<Player>();
const lastDamageByPlayer = new Map<string, { attacker: Player; expireTick: number }>();
const LAST_DAMAGE_TTL = 10 * 20;
const PLAYER_KILL_SOUND_ID = 'random.levelup';
const PLAYER_DEATH_SOUND_ID = 'random.hurt';

world.afterEvents.entityHurt.subscribe((ev) => {
    if (!(ev.hurtEntity instanceof Player) || !MemberManager.includePlayer(ev.hurtEntity)) return;
    if (!(ev.damageSource.damagingEntity instanceof Player)) return;

    const attacker = ev.damageSource.damagingEntity;
    if (attacker === ev.hurtEntity) return;

    lastDamageByPlayer.set(ev.hurtEntity.name, {
        attacker,
        expireTick: system.currentTick + LAST_DAMAGE_TTL,
    });
});

world.afterEvents.entityDie.subscribe((ev) => {
    if (!(ev.deadEntity instanceof Player) || !MemberManager.includePlayer(ev.deadEntity)) return;
    const deadPlayer = ev.deadEntity;
    const source = ev.damageSource;
    const attacker = source.damagingEntity ?? getRecentAttacker(deadPlayer);
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
    lastDamageByPlayer.delete(deadPlayer.name);

    set_entity_dynamic_property(deadPlayer, 'player:is_alive', false);
    set_variable(`${deadPlayer.name}.deaths`, (variable(`${deadPlayer.name}.deaths`) || 0) + 1);

    if (attacker && attacker !== deadPlayer) {
        showDeathMessage(deadPlayer, attacker);
        set_variable(`${attacker.name}.kills`, (variable(`${attacker.name}.kills`) || 0) + 1);
    }

    gameroom().activeMode.onPlayerDeath?.(deadPlayer, attacker);
});

function getRecentAttacker(deadPlayer: Player) {
    const lastDamage = lastDamageByPlayer.get(deadPlayer.name);
    lastDamageByPlayer.delete(deadPlayer.name);

    if (!lastDamage) return undefined;
    if (system.currentTick > lastDamage.expireTick) return undefined;
    if (!lastDamage.attacker.isValid) return undefined;

    return lastDamage.attacker;
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
    Sound.playTo(PLAYER_KILL_SOUND_ID, attacker, { pitch: 1.4, volume: 1 });
    Sound.playTo(PLAYER_DEATH_SOUND_ID, deadPlayer, { volume: 1, pitch: 0.9 });
}
