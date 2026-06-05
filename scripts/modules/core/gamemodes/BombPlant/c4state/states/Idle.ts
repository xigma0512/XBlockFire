import { MemberManager } from '../../../../../player/MemberManager';
import { C4Manager } from '../C4Manager';
import { HudDriver } from '../../../../../../ui/hud/drivers/HudDriver';

import { C4DroppedState } from './Dropped';
import { C4PlantingState } from './Planting';

import { C4StateEnum } from '../C4StateEnum';
import { TeamEnum } from '../../../../../player/TeamEnum';

import { Language as L } from '../../../../../../utils/Language';
import { FormatCode as FC } from '../../../../../../utils/FormatCode';

import { Player, system, world } from '@minecraft/server';
import { EntitySpawnAfterEvent, ItemUseBeforeEvent } from '@minecraft/server';

const C4_ITEM_ID = 'xblockfire:c4';

export class C4IdleState implements IC4StateHandler {
    readonly stateTag = C4StateEnum.Idle;

    private beforeItemUseListener = (ev: ItemUseBeforeEvent) => {};
    private afterEntitySpawnListener = (ev: EntitySpawnAfterEvent) => {};

    constructor() {}

    on_entry() {
        world
            .getDimension('overworld')
            .getEntities({ families: ['c4'] })
            .forEach((c4) => c4.remove());

        this.beforeItemUseListener = world.beforeEvents.itemUse.subscribe(this.onBeforeItemUse.bind(this));
        this.afterEntitySpawnListener = world.afterEvents.entitySpawn.subscribe(this.onEntitySpawn.bind(this));
    }

    on_running() {}

    on_exit() {
        world.beforeEvents.itemUse.unsubscribe(this.beforeItemUseListener);
        world.afterEvents.entitySpawn.unsubscribe(this.afterEntitySpawnListener);
    }

    private onBeforeItemUse(ev: ItemUseBeforeEvent) {
        if (ev.itemStack.typeId !== C4_ITEM_ID) return;

        const { source } = ev;
        if (!MemberManager.includePlayer(source)) return;

        ev.cancel = !canPlantC4(source);
        if (!ev.cancel) {
            system.run(() => {
                C4Manager.updateState(new C4PlantingState(ev.source));
            });
        }
    }

    private onEntitySpawn(ev: EntitySpawnAfterEvent) {
        const entity = ev.entity;
        if (!entity.isValid || !entity.hasComponent('item')) return;

        const itemComp = entity.getComponent('item')!;
        if (itemComp.itemStack.typeId !== C4_ITEM_ID) return;

        const player = entity.dimension
            .getEntities({ location: entity.location, maxDistance: 2, type: 'minecraft:player' })
            .find((p) => MemberManager.includePlayer(p as Player));

        if (!player || !(player instanceof Player)) {
            entity.remove();
            throw Error(
                `C4 item entity spawned at {${entity.location.x}, ${entity.location.y}, ${entity.location.z}} but no owning player found in room `
            );
        }

        C4Manager.updateState(new C4DroppedState(entity.location));
        entity.remove();
    }
}

function canPlantC4(source: Player) {
    try {
        const sourceTeam = MemberManager.getPlayerTeam(source);
        if (sourceTeam !== TeamEnum.Attacker) {
            throw new Error(L.translate('c4.planting.not_attacker'));
        }

        const { dimension, location } = source;
        let isAtTarget = false;

        const x = Math.floor(location.x);
        const z = Math.floor(location.z);

        for (let y = location.y; y >= 0; y--) {
            const block = dimension.getBlock({ x, y, z });
            if (block?.typeId === 'minecraft:redstone_block') {
                isAtTarget = true;
                break;
            }
        }

        if (!isAtTarget) {
            throw new Error(L.translate('c4.planting.outside_range'));
        }

        return true;
    } catch (err: any) {
        HudDriver.pushActionbar(source, `${FC.Red}${err.message}`, 40);
        return false;
    }
}
