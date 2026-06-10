import { MemberManager } from '../../../../player/MemberManager';
import { PhaseManager } from '../../../gamephase/PhaseManager';
import { ActionView as ActionHud } from '../../../../../ui/hud/views/ActionView';
import { HotbarManager } from '../../../../../ui/hotbar/Hotbar';

import { ActionPhase } from './Action';

import { PhaseEnum as BombPlantPhaseEnum } from './BombPlantPhaseEnum';

import { Sound } from '../../../../../ui/media/Sound';
import { set_entity_native_property } from '../../../../../utils/Property';
import { ItemStackFactory } from '../../../../../utils/ItemStackFactory';

import { InputPermissionCategory, ItemLockMode } from '@minecraft/server';
import { uiManager } from '@minecraft/server-ui';

import { BombPlantConfig } from '../BombPlantConfig';

const START_ROUND_SOUND_ID = 'mob.villager.idle';
const ACTION_START_SOUND_ID = 'mob.blaze.shoot';
const BUYING_COUNTDOWN_TICK_SOUND_ID = 'random.click';

export class BuyingPhase implements IPhaseHandler {
    readonly phaseId = BombPlantPhaseEnum.Buying;
    readonly hud: ActionHud;

    private _currentTick: number = BombPlantConfig.BUYING_TIME;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        if (this._currentTick === BombPlantConfig.BUYING_TIME) {
            Sound.playTo(START_ROUND_SOUND_ID, MemberManager.getPlayers(), { volume: 1 });
            sendShopItem();
        }
    }

    on_running() {
        playBuyingCountdown(this.currentTick);
        this._currentTick--;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        Sound.playTo(ACTION_START_SOUND_ID, MemberManager.getPlayers(), { pitch: 1.2, volume: 1 });
        restorePlayerDefaults();
    }

    private transitions() {
        if (this.currentTick <= 0) return PhaseManager.updatePhase(new ActionPhase());
    }
}

function playBuyingCountdown(currentTick: number) {
    if (currentTick <= 5 * 20 && currentTick > 0 && currentTick % 20 === 0) {
        Sound.playTo(BUYING_COUNTDOWN_TICK_SOUND_ID, MemberManager.getPlayers(), { pitch: 1.5, volume: 1 });
    }
}

function sendShopItem() {
    for (const player of MemberManager.getPlayers()) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        hotbar.items[8] = ItemStackFactory.new({ typeId: 'minecraft:feather', lockMode: ItemLockMode.slot });
        HotbarManager.sendHotbar(player, hotbar);
    }
}

function restorePlayerDefaults() {
    for (const player of MemberManager.getPlayers()) {
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, true);
        set_entity_native_property(player, 'player:can_use_item', true);

        // clear feather(shop)
        const hotbar = HotbarManager.getPlayerHotbar(player);
        hotbar.items[8] = undefined;
        HotbarManager.sendHotbar(player, hotbar);

        uiManager.closeAllForms(player);
    }
}
