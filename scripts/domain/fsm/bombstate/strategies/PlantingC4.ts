import { ItemUseBeforeEvent, Player, system, world } from "@minecraft/server";
import { Vector3Utils } from "@minecraft/math";

import { MemberManager } from "../../../player/MemberManager";
import { MapRegister } from "../../../gameroom/MapRegister";
import { gameroom } from "../../../gameroom/GameRoom";

import { HudTextController } from "../../../../interface/hud/HudTextController";

import { lang } from "../../../../infrastructure/Language";
import { progressBar } from "../../../../infrastructure/utils/Format";
import { gameEvents } from "../../../../infrastructure/event/EventEmitter";
import { set_variable, variable } from "../../../../infrastructure/data/Variable";

import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

import { BombPlant as Config } from "../../../../settings/config";

const C4_ITEM_ID = 'xblockfire:c4';

const PLANTING_SOUND_SELF = 'xblockfire.planting.self';
const PLANTING_SOUND_PUBLIC = 'xblockfire.planting.broadcast'

export class PlantingC4Strategy implements IBombStateStrategy {
    
    private beforeItemUseCallback = (ev: ItemUseBeforeEvent) => { };

    initialize() {
        this.beforeItemUseCallback = world.beforeEvents.itemUse.subscribe(this.onItemUseBefore);
    }

    dispose() {
        world.beforeEvents.itemUse.unsubscribe(this.beforeItemUseCallback);
    }

    private onItemUseBefore(ev: ItemUseBeforeEvent) {
        const {source, itemStack} = ev;
        if (itemStack.typeId !== C4_ITEM_ID) return;

        const isAllow = canPlayerPlantingC4(source);
        ev.cancel = !isAllow;

        if (isAllow) {
            system.run(() => playerPlantingC4(source));
        }
    }

}

function canPlayerPlantingC4(source: Player) {
    const sourceTeam = MemberManager.getPlayerTeam(source);
    if (sourceTeam !== TeamEnum.Attacker) {
        source.sendMessage(`You are not at Attacker team.`);
        return false;
    }

    const mapInfo = MapRegister.getMap(gameroom().gameMapId);
    const targetRange = Config.c4.target_range;

    const isAtTarget = mapInfo.positions.C4_targets.some((target, index) => {
        const distance = Vector3Utils.distance(source.location, target);
        if (distance <= targetRange) {
            set_variable(`c4.plant_site_index`, index);
            return true;
        }
        return false;
    });

    if (!isAtTarget) {
        HudTextController.add(source, 'actionbar', lang('player.c4.planting_outside_range'));
        return false;
    }

    return true;
}

function playerPlantingC4(source: Player) {

    source.dimension.playSound(PLANTING_SOUND_PUBLIC, source.location, { volume: 2 });
    source.playSound(PLANTING_SOUND_SELF);

    const totalPlantingTime = Config.c4.planting_time;
    let currentTime = totalPlantingTime;

    const taskId = system.runInterval(() => {
        HudTextController.add(source, 'actionbar', progressBar(totalPlantingTime, currentTime--));
        if (currentTime <= 0) {
            gameEvents.emit('onC4Planted', { source, site: variable('c4.plant_site_index') });
            world.afterEvents.itemStopUse.unsubscribe(itemStopUseCallback);
            system.clearRun(taskId);
        }
    });

    const itemStopUseCallback = world.afterEvents.itemStopUse.subscribe(ev => {
        if (ev.source.id !== source.id) return;
        ev.source.stopSound(PLANTING_SOUND_SELF);
        system.clearRun(taskId);
        world.afterEvents.itemStopUse.unsubscribe(itemStopUseCallback);
    });
}