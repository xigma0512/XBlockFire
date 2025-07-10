import { GameRoomManager } from "../../gameroom/GameRoom";
import { ActionPhase } from "./Action";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action";
import { HotbarManager } from "../../../modules/hotbar/Hotbar";

import { Config } from "./_config";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";

import { Broadcast } from "../../../utils/Broadcast";
import { set_entity_native_property } from "../../../utils/Property";
import { ItemStackFactory } from "../../../utils/ItemStackFactory";

import { InputPermissionCategory, ItemLockMode } from "@minecraft/server";

const config = Config.buying;

export class BuyingPhase implements IPhaseHandler {

    readonly hud: ActionHud;
    readonly phaseTag = BombPlantPhaseEnum.Buying;

    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) {        
        this.hud = new ActionHud(roomId);
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        sendShopItem(this.roomId);
    }

    on_running() {        
        if (this._currentTick-- % 20 == 0) {
            const room = GameRoomManager.getRoom(this.roomId);
            Broadcast.sound("block.click", { pitch: 2 }, room.memberManager.getPlayers());
        }
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        restorePlayerDefaults(this.roomId);        
    }

    private transitions() {
        const room = GameRoomManager.getRoom(this.roomId);
        if (this.currentTick <= 0) room.phaseManager.updatePhase(new ActionPhase(this.roomId));
    }

}

function sendShopItem(roomId: number) {
    const room = GameRoomManager.getRoom(roomId);
    const member = room.memberManager;

    for (const player of member.getPlayers()) {
        const hotbar = HotbarManager.getPlayerHotbar(player)
        hotbar.items[8] = ItemStackFactory.new({ typeId: 'minecraft:feather', lockMode: ItemLockMode.slot });
        HotbarManager.sendHotbar(player, hotbar);
    }
}

function restorePlayerDefaults(roomId: number) {
    const room = GameRoomManager.getRoom(roomId);
    const member = room.memberManager;

    for (const player of member.getPlayers()) {
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, true);
        set_entity_native_property(player, 'player:can_use_item', true);

        // clear feather(shop)
        const hotbar = HotbarManager.getPlayerHotbar(player)
        hotbar.items[8] = undefined;
        HotbarManager.sendHotbar(player, hotbar);
    }
}