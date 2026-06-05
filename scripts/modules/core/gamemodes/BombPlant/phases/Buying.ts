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

const COUNTDOWN_TIME = 20 * 20;

export class BuyingPhase implements IPhaseHandler {
    readonly phaseId = BombPlantPhaseEnum.Buying;
    readonly hud: ActionHud;

    private _currentTick: number = COUNTDOWN_TIME;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = COUNTDOWN_TIME;
        Sound.play('START_ROUND', MemberManager.getPlayers(), {});
        sendShopItem();
    }

    on_running() {
        playBuyingCountdown(this.currentTick);
        this._currentTick--;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        Sound.play('ACTION_START', MemberManager.getPlayers(), {});
        restorePlayerDefaults();
    }

    private transitions() {
        if (this.currentTick <= 0) return PhaseManager.updatePhase(new ActionPhase());
    }
}

function playBuyingCountdown(currentTick: number) {
    if (currentTick <= 5 * 20 && currentTick > 0 && currentTick % 20 === 0) {
        Sound.play('BUYING_COUNTDOWN_TICK', MemberManager.getPlayers(), {});
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
