import { GameRoomManager } from "../../gameroom/GameRoom";
import { ActionPhase } from "./Action";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action";
import { HotbarManager } from "../../../modules/hotbar/Hotbar";

import { Config } from "./_config";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";

import { InputPermissionCategory, ItemStack } from "@minecraft/server";

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
        console.warn(`[Room ${this.roomId}] Entry BP:buying phase.`);
    }

    on_running() {
        this._currentTick --;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        restorePlayerDefaults(this.roomId);        
        console.warn(`[Room ${this.roomId}] Exit BP:buying phase.`);
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);
        if (this.currentTick <= 0) room.phaseManager.updatePhase(new ActionPhase(this.roomId));
    }

}

function sendShopItem(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const member = room.memberManager;

    for (const player of member.getPlayers()) {
        const hotbar = HotbarManager.getPlayerHotbar(player)
        hotbar.items[8] = new ItemStack('minecraft:feather');
        HotbarManager.sendHotbar(player, hotbar);
    }
}

function restorePlayerDefaults(roomId: number) {
    const room = GameRoomManager.instance.getRoom(roomId);
    const member = room.memberManager;

    for (const player of member.getPlayers()) {
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, true);

        // clear feather(shop)
        const hotbar = HotbarManager.getPlayerHotbar(player)
        hotbar.items[8] = undefined;
        HotbarManager.sendHotbar(player, hotbar);
    }
}