import { GamePhaseManager } from "../GamePhaseManager";
import { MemberManager } from "../../../player/MemberManager";
import { BombStateManager } from "../../bombstate/BombStateManager";

import { ActionHud } from "../../../../interface/hud/ingame/bomb_plant/Action";
import { C4IdleState } from "../../bombstate/states/Idle";
import { IdlePhase } from "./Idle";

import { TeamEnum } from "../../../../declarations/enum/TeamEnum";
import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";

import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { variable } from "../../../../infrastructure/data/Variable";
import { lang } from "../../../../infrastructure/Language";

import { GameMode, world } from "@minecraft/server";

import { BombPlant as Config } from "../../../../settings/config";

export class GameOverPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.Gameover;
    readonly hud: ActionHud;

    constructor() {
        this.phaseTag = BombPlantPhaseEnum.Gameover;
        this.hud = new ActionHud();
        GamePhaseManager.currentTick = Config.phaseTime.gameover;
    }

    on_entry() {
        notifyWinner();
    }

    on_running() {
        const currentTick = GamePhaseManager.currentTick;
        if (currentTick % 20 == 0) {
            Broadcast.sound("firework.launch", {});
        }
        return true;
    }

    on_exit() {
        resetbombstate();
        respawnPlayers();
        showScoreboard();
    }

    transitions() {
        const currentTick = GamePhaseManager.currentTick;
        if (currentTick <= 0) {
            GamePhaseManager.updatePhase(new IdlePhase());
        }
    }

}

function notifyWinner() {
    switch (variable('winner')) {
        case TeamEnum.Attacker:
            Broadcast.message(lang('game.bombplant.gameover.attacker_win'));
            break;
        case TeamEnum.Defender:
            Broadcast.message(lang('game.bombplant.gameover.defender_win'));
    }
}

function resetbombstate() {
    BombStateManager.updateState(new C4IdleState());
}

function respawnPlayers() {
    for (const player of world.getAllPlayers()) {
        player.setGameMode(GameMode.Adventure);
        player.teleport(world.getDefaultSpawnLocation());
    }
}

function showScoreboard() {
    let stat = lang('game.scoreboard.title');
    for (const player of MemberManager.getPlayers()) {
        stat += lang('game.scoreboard.format', player.name, variable(`${player.name}.kills`), variable(`${player.name}.deaths`));
    }
    Broadcast.message(stat);
}