import { gameroom } from "../../gameroom/GameRoom";
import { MemberManager } from "../../member/MemberManager";
import { C4Manager } from "../C4Manager";
import { MapRegister } from "../../gamemap/MapRegister";
import { MessageManager as Msg } from "../../../modules/hud/MessageManager";

import { C4DroppedState } from "./Dropped";
import { C4PlantingState } from "./Planting";

import { C4StateEnum } from "../C4StateEnum";
import { TeamEnum } from "../../member/TeamEnum";

import { set_variable } from "../../../utils/Variable";
import { FormatCode as FC } from "../../../utils/FormatCode";

import { Vector3Utils } from "@minecraft/math";
import { Player, system, world } from "@minecraft/server";
import { EntitySpawnAfterEvent, ItemUseBeforeEvent } from "@minecraft/server";

import { Config } from "../../../settings/config";

const C4_ITEM_ID = 'xblockfire:c4';
const C4_TARGET_RANGE = Config.c4.C4_TARGET_RANGE;

export class C4IdleState implements IC4StateHandler {

    readonly stateTag = C4StateEnum.Idle;

    private beforeItemUseListener = (ev: ItemUseBeforeEvent) => { };
    private afterEntitySpawnListener = (ev: EntitySpawnAfterEvent) => { };

    constructor() { }

    on_entry() {
        
        world.getDimension('overworld').getEntities({families: ['c4']}).forEach(c4 => c4.remove());

        this.beforeItemUseListener = world.beforeEvents.itemUse.subscribe(this.onBeforeItemUse.bind(this));
        this.afterEntitySpawnListener = world.afterEvents.entitySpawn.subscribe(this.onEntitySpawn.bind(this));
    }

    on_running() { }

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
            .find(p => MemberManager.includePlayer(p as Player));
        
        if (!player || !(player instanceof Player)) {
            entity.remove();
            throw Error(`C4 item entity spawned at {${entity.location.x}, ${entity.location.y}, ${entity.location.z}} but no owning player found in room `);
        }

        C4Manager.updateState(new C4DroppedState(entity.location));
        entity.remove();
    }

}

function canPlantC4(source: Player) {
    try {
        const sourceTeam = MemberManager.getPlayerTeam(source);
        if (sourceTeam !== TeamEnum.Attacker) {
            throw new Error(`You are not at Attacker team.`);
        }

        const { dimension, location } = source;
        let isAtTarget = false;

        const x = Math.floor(location.x);
        const z = Math.floor(location.z)

        for (let y = location.y; y >= 0; y--) {
            const block = dimension.getBlock({ x, y, z });
            if (block?.typeId === 'minecraft:redstone_block') {
                isAtTarget = true;
                break;
            }
        }

        if (!isAtTarget) {
            throw new Error('Cannot plant c4 outside the C4 target position');
        }

        return true;

    } catch (err: any) {
        Msg.rawActionbar(`${FC.Red}${err.message}`, source);
        return false;
    }
}
