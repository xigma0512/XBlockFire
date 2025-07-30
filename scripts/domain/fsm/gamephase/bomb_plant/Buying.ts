import { MemberManager } from "../../../player/MemberManager";
import { GamePhaseManager } from "../GamePhaseManager";
import { PurchaseHistory } from "../../../economy/PurchaseHistory";
import { HotbarManager } from "../../../player/HotbarManager";
import { ActionPhase } from "./Action";

import { ActionHud } from "../../../../interface/hud/ingame/bomb_plant/Action";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";

import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { set_entity_native_property } from "../../../../infrastructure/data/Property";
import { ItemStackFactory } from "../../../../infrastructure/utils/ItemStackFactory";

import { InputPermissionCategory, ItemLockMode } from "@minecraft/server";
import { uiManager } from "@minecraft/server-ui";

import { Config } from "../../../../settings/config";

const config = Config.bombplant.buying;

export class BuyingPhase implements IPhaseHandler {

    readonly hud: ActionHud;
    readonly phaseTag = BombPlantPhaseEnum.Buying;

    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor() {        
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        sendShopItem();
    }

    on_running() {        
        if (this._currentTick-- % 20 == 0) {
            Broadcast.sound("block.click", { pitch: 2 }, MemberManager.getPlayers());
        }
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        restorePlayerDefaults();        
    }

    private transitions() {
        if (this.currentTick <= 0) GamePhaseManager.updatePhase(new ActionPhase());
    }

}

function sendShopItem() {
    PurchaseHistory.clearAll();
    for (const player of MemberManager.getPlayers()) {
        const hotbar = HotbarManager.getPlayerHotbar(player)
        hotbar.items[8] = ItemStackFactory.new({ typeId: 'minecraft:feather', lockMode: ItemLockMode.slot });
        HotbarManager.sendHotbar(player, hotbar);
    }
}

function restorePlayerDefaults() {
    for (const player of MemberManager.getPlayers()) {
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, true);
        set_entity_native_property(player, 'player:can_use_item', true);

        // clear feather(shop)
        const hotbar = HotbarManager.getPlayerHotbar(player)
        hotbar.items[8] = undefined;
        HotbarManager.sendHotbar(player, hotbar);

        uiManager.closeAllForms(player);
    }
}