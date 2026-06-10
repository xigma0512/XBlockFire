import { MemberManager } from '../../../player/MemberManager';
import { C4Manager } from '../C4Manager';

import { C4IdleState } from './Idle';

import { TeamEnum } from '../../../player/TeamEnum';
import { C4StateEnum } from '../C4StateEnum';

import { HudDriver } from '../../../../ui/hud/drivers/HudDriver';
import { FormatCode as FC } from '../../../../utils/FormatCode';
import { Language as L } from '../../../../utils/Language';

import { Entity, EntityHitEntityAfterEvent, ItemStack, Player, VanillaEntityIdentifier, Vector3, world } from '@minecraft/server';

const DROPPED_C4_ENTITY_ID = 'xblockfire:dropped_c4' as VanillaEntityIdentifier;
const C4_ITEM_ID = 'xblockfire:c4';
const ROTATION_SPEED = 7.5;

export class C4DroppedState implements IC4StateHandler {
    readonly stateTag = C4StateEnum.Dropped;

    private _entity!: Entity;
    get entity() {
        return this._entity;
    }

    private afterEntityHitEntityListener: (ev: EntityHitEntityAfterEvent) => void;

    constructor(private location: Vector3) {
        this.location = location;

        this.afterEntityHitEntityListener = this.onEntityHit.bind(this);
    }

    on_entry() {
        this._entity = world.getDimension('overworld').spawnEntity(DROPPED_C4_ENTITY_ID, this.location);
        world.afterEvents.entityHitEntity.subscribe(this.afterEntityHitEntityListener);

        const text = FC.MaterialCopper + L.translate('c4.dropped');
        HudDriver.chat(text, MemberManager.getPlayers({ team: TeamEnum.Attacker }));
    }

    on_running() {
        if (!this.entity.isValid) {
            C4Manager.updateState(new C4IdleState());
            return;
        }

        const rotation = this.entity.getRotation();
        rotation.y = (rotation.y + ROTATION_SPEED) % 360;
        this.entity.setRotation(rotation);
    }

    on_exit() {
        world.afterEvents.entityHitEntity.unsubscribe(this.afterEntityHitEntityListener);
        this.entity.remove();
    }

    private onEntityHit(ev: EntityHitEntityAfterEvent) {
        if (ev.hitEntity.id !== this.entity.id) return;

        const player = ev.damagingEntity;
        if (!(player instanceof Player)) return;

        this.attemptToPickup(player);
    }

    private attemptToPickup(player: Player) {
        const playerTeam = MemberManager.getPlayerTeam(player);
        if (playerTeam !== TeamEnum.Attacker) return;

        player.getComponent('inventory')?.container.setItem(3, new ItemStack(C4_ITEM_ID));

        const attackers = MemberManager.getPlayers({ team: TeamEnum.Attacker });

        const text = FC.Blue + L.translate('c4.pickup.broadcast', player.name);
        HudDriver.chat(text, attackers);

        C4Manager.updateState(new C4IdleState());
    }
}
