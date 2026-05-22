import { MemberManager } from "../../member/MemberManager";
import { PhaseManager } from "../PhaseManager";
import { ActionHud } from "../../../modules/hud/bomb_plant/Action";

import { ActionPhase } from "./Action";

import { PhaseEnum as BombPlantPhaseEnum } from "../BombPlantPhaseEnum";
import { TeamEnum } from "../../member/TeamEnum";

import { MessageManager as Msg } from "../../../modules/hud/MessageManager";

import { Config } from "../../../settings/config";

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
    }

    on_running() {
        this._currentTick --;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
    }

    private transitions() {
        if (this.currentTick <= 0) return PhaseManager.updatePhase(new ActionPhase());
    }

}
