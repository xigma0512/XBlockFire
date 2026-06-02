import { Entity, Player } from '@minecraft/server';
import { FireModeEnum } from '../modules/combat/weapon/WeaponEnum';

export interface GameEvent {
    playerDied: {
        deadPlayer: Player;
        attacker?: Entity;
    };
    gunFired: {
        shooter: Player;
        fireMode: FireModeEnum;
        fireRate: number;
    };
}
