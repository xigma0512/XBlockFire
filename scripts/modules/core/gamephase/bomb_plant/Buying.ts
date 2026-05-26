import { MemberManager } from "../../../player/MemberManager";
import { PhaseManager } from "../PhaseManager";
import { ActionHud } from "../../../../ui/hud/huds/Action";
import { HotbarManager } from "../../../../ui/Hotbar";
import { EconomyManager } from "../../EconomyManager";

import { ActionPhase } from "./Action";

import { PurchaseHistory, Shop } from "../../../../ui/shop/Shop";

import { PhaseEnum as BombPlantPhaseEnum } from "../BombPlantPhaseEnum";
import { TeamEnum } from "../../../player/TeamEnum";

import { MessageManager as Msg } from "../../../../ui/Message";
import { set_entity_native_property } from "../../../../utils/Property";
import { ItemStackFactory } from "../../../../utils/ItemStackFactory";

import { InputPermissionCategory, ItemLockMode } from "@minecraft/server";
import { uiManager } from "@minecraft/server-ui";

import { Config } from "../../../../settings/config";

const config = Config.bombplant.buying;

const VOICE_START_ROUND_SOUND_ID = 'xblockfire.start_round';

export class BuyingPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.Buying;
    readonly hud: ActionHud;
    
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        Msg.sound(VOICE_START_ROUND_SOUND_ID, {}, MemberManager.getPlayers());
        sendShopItem();
    }

    on_running() {
        this._currentTick --;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        restorePlayerDefaults();
    }

    private transitions() {
        if (this.currentTick <= 0) return PhaseManager.updatePhase(new ActionPhase());
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


