import { PhaseManager } from "../PhaseManager";
import { MemberManager } from "../../../player/MemberManager";
import { C4Manager } from "../../c4state/C4Manager";

import { ActionHud } from "../../../../ui/hud/huds/Action";
import { C4IdleState } from "../../c4state/states/Idle";
import { IdlePhase } from "./Idle";

import { TeamEnum } from "../../../player/TeamEnum";
import { PhaseEnum as BombPlantPhaseEnum } from "../BombPlantPhaseEnum";

import { MessageManager as Msg } from "../../../../ui/Message";
import { variable } from "../../../../utils/Variable";

import { GameMode, world } from "@minecraft/server";

import { Config } from "../../../../settings/config";

const config = Config.bombplant.gameover;

export class GameOverPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.Gameover;
    readonly hud: ActionHud;
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        const winner = variable('winner');
        if (winner === TeamEnum.Attacker || winner === TeamEnum.Defender) {
            const langKey = winner === TeamEnum.Attacker ? "game.over.attacker_win" : "game.over.defender_win";
            Msg.message(langKey);
        }
    }

    on_running() {
        if (this._currentTick-- % 20 == 0) {
            Msg.sound("firework.launch", {}, world.getAllPlayers());
        }
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        resetC4State();
        respawnPlayers();
        showScoreboard();
    }

    private transitions() {
        if (this.currentTick <= 0) PhaseManager.updatePhase(new IdlePhase());
    }

}

function resetC4State() {
    C4Manager.updateState(new C4IdleState());
}

function respawnPlayers() {
    for (const player of world.getAllPlayers()) {
        player.setGameMode(GameMode.Adventure);
        player.teleport(world.getDefaultSpawnLocation());
    }
}

function showScoreboard() {
    let stat = Msg.translate("game.scoreboard.header") + `\n`;
    for (const player of MemberManager.getPlayers()) {
        stat += `${player.name} | K:${variable(`${player.name}.kills`)} D:${variable(`${player.name}.deaths`)}\n`;
    }
    Msg.rawMessage(stat);
}


