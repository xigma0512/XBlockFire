import { InputPermissionCategory, ItemLockMode } from "@minecraft/server";
import { uiManager } from "@minecraft/server-ui";

import { MemberManager } from "../../../player/MemberManager";
import { GamePhaseManager } from "../GamePhaseManager";
import { PurchaseHistory } from "../../../economy/PurchaseHistory";
import { HotbarManager } from "../../../player/HotbarManager";
import { ActionPhase } from "./Action";

import { ActionHud } from "../../../../interface/hud/ingame/bomb_plant/Action";

import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { set_entity_native_property } from "../../../../infrastructure/data/Property";
import { ItemStackFactory } from "../../../../infrastructure/utils/ItemStackFactory";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";

import { BombPlant as Config } from "../../../../settings/config";

export class BuyingPhase implements IPhaseHandler {

    readonly phaseTag;
    readonly hud;

    constructor() {        
        this.phaseTag = BombPlantPhaseEnum.Buying;
        this.hud = new ActionHud();
        GamePhaseManager.currentTick = Config.phaseTime.buying;
    }

    on_entry() {
        sendShopItem();
    }

    on_running() {
        const currentTick = GamePhaseManager.currentTick;
        if (currentTick % 20 == 0) {
            Broadcast.sound("block.click", { pitch: 2 });
        }
        return true;
    }

    on_exit() {
        closeShop();
    }

    transitions() {
        if (GamePhaseManager.currentTick <= 0) {
            GamePhaseManager.updatePhase(new ActionPhase());
        }
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

function closeShop() {
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