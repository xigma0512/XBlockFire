import { ItemUseBeforeEvent, Player, system, world } from "@minecraft/server";
import { Vector3Utils } from "@minecraft/math";

import { MemberManager } from "../../../player/MemberManager";
import { BombStateManager } from "../BombStateManager";

import { HudTextController } from "../../../../interface/hud/HudTextController";

import { lang } from "../../../../infrastructure/Language";
import { progressBar } from "../../../../infrastructure/utils/Format";
import { gameEvents } from "../../../../infrastructure/event/EventEmitter";

import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

import { BombPlant as Config } from "../../../../settings/config";

const DEFUSER_ITEM_ID = 'xblockfire:defuser';
const DEFUSING_SOUND = 'xblockfire.defusing';

export class DefusingC4Strategy implements IBombStateStrategy {
    
    private beforeItemUseCallback = (ev: ItemUseBeforeEvent) => { };

    initialize() {
        this.beforeItemUseCallback = world.beforeEvents.itemUse.subscribe(this.onItemUseBefore);
    }

    dispose() {
        world.beforeEvents.itemUse.unsubscribe(this.beforeItemUseCallback);
    }

    private onItemUseBefore(ev: ItemUseBeforeEvent) {
        const {source, itemStack} = ev;
        if (itemStack.typeId !== DEFUSER_ITEM_ID) return;

        const isAllow = canPlayerDefuseC4(source);
        if (isAllow) playerDefusingC4(source);
        ev.cancel = !isAllow;
    }

}

function canPlayerDefuseC4(source: Player) {
    const sourceTeam = MemberManager.getPlayerTeam(source);
    if (sourceTeam !== TeamEnum.Defender) {
        source.sendMessage(`You are not at Defender team.`);
        return false;
    }

    const bombLocation = BombStateManager.c4Entity!.location;
    const distance = Vector3Utils.distance(source.location, bombLocation);
    const defusingRange = Config.c4.defuse_range;
    if (distance > defusingRange) {
        HudTextController.add(source, 'actionbar', lang('player.c4.defusing_outside_range'));
        return false;
    }

    return true;
}

function playerDefusingC4(source: Player) {
    
    source.dimension.playSound(DEFUSING_SOUND, source.location, { volume: 2 });

    const totalPlantingTime = Config.c4.defusing_time;
    let currentTime = totalPlantingTime;
    const taskId = system.runInterval(() => {
        HudTextController.add(source, 'actionbar', progressBar(totalPlantingTime, currentTime));
        if (currentTime <= 0) {
            gameEvents.emit('onC4Defused', { source });
            world.afterEvents.itemStopUse.unsubscribe(itemStopUseCallback);
            system.clearRun(taskId);
        }
    });

    const itemStopUseCallback = world.afterEvents.itemStopUse.subscribe(ev => {
        if (ev.source.id !== source.id) return;
        system.clearRun(currentTime);
        world.afterEvents.itemStopUse.unsubscribe(itemStopUseCallback);
    });
}