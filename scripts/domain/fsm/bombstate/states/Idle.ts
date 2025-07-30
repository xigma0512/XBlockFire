import { gameroom } from "../../../gameroom/GameRoom";
import { MemberManager } from "../../../player/MemberManager";
import { BombStateManager } from "../BombStateManager";
import { MapRegister } from "../../../gameroom/MapRegister";
import { HudTextController } from "../../../../interface/hud/HudTextController";

import { C4DroppedState } from "./Dropped";
import { C4PlantingState } from "./Planting";

import { BombStateEnum } from "../../../../declarations/enum/BombStateEnum";
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

import { set_variable } from "../../../../infrastructure/data/Variable";
import { FormatCode as FC } from "../../../../declarations/enum/FormatCode";

import { Vector3Utils } from "@minecraft/math";
import { Player, system, world } from "@minecraft/server";
import { EntitySpawnAfterEvent, ItemUseBeforeEvent } from "@minecraft/server";

import { Config } from "../../../../settings/config";

const C4_ITEM_ID = 'xblockfire:c4';
const C4_TARGET_RANGE = Config.c4.C4_TARGET_RANGE;

export class C4IdleState implements IBombStateHandler {

    readonly stateTag = BombStateEnum.Idle;

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

        ev.cancel = !canPlantC4(source);
        if (!ev.cancel) {
            system.run(() => {
                BombStateManager.updateState(new C4PlantingState(ev.source));
            });
        }
    }

    private onEntitySpawn(ev: EntitySpawnAfterEvent) {
        const entity = ev.entity;
        if (!entity.isValid || !entity.hasComponent('item')) return;

        const itemComp = entity.getComponent('item')!;
        if (itemComp.itemStack.typeId !== C4_ITEM_ID) return;

        const player = entity.dimension.getEntities({ 
            location: entity.location, 
            maxDistance: 2, 
            type: 'minecraft:player' 
        });
        
        if (!player || !(player instanceof Player)) {
            entity.remove();
            throw Error(`C4 item entity spawned at {${entity.location.x}, ${entity.location.y}, ${entity.location.z}} but no owning player found in room `);
        }

        BombStateManager.updateState(new C4DroppedState(entity.location));
        entity.remove();
    }

}

function canPlantC4(source: Player) {
    try {
        const sourceTeam = MemberManager.getPlayerTeam(source);
        if (sourceTeam !== TeamEnum.Attacker) {
            throw new Error(`You are not at Attacker team.`);
        }

        const mapInfo = MapRegister.getMap(gameroom().gameMapId);
        const isAtTarget = mapInfo.positions.C4_targets.some((target, index) => {
            const distance = Vector3Utils.distance(source.location, target);
            if (distance <= C4_TARGET_RANGE) {
                set_variable(`c4.plant_site_index`, index);
                return true;
            }
            return false;
        });

        if (!isAtTarget) {
            throw new Error('Cannot plant c4 outside the C4 target position');
        }

        return true;

    } catch (err: any) {
        HudTextController.add(source, 'actionbar', `${FC.Red}${err.message}`);
        return false;
    }
}