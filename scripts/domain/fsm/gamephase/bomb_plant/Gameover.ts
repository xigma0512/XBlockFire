import { GamePhaseManager } from "../GamePhaseManager";
import { MemberManager } from "../../../player/MemberManager";
import { BombStateManager } from "../../bombstate/BombStateManager";

import { ActionHud } from "../../../../interface/hud/ingame/bomb_plant/Action";
import { C4IdleState } from "../../bombstate/states/Idle";
import { IdlePhase } from "./Idle";

import { TeamEnum } from "../../../../declarations/enum/TeamEnum";
import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";

import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { FormatCode as FC } from "../../../../declarations/enum/FormatCode";
import { variable } from "../../../../infrastructure/data/Variable";

import { GameMode, world } from "@minecraft/server";

import { Config } from "../../../../settings/config";

export class GameOverPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.Gameover;
    readonly hud: ActionHud;

    constructor() {
        this.phaseTag = BombPlantPhaseEnum.Gameover;
        this.hud = new ActionHud();
        GamePhaseManager.currentTick = Config.bombplant.gameover.COUNTDOWN_TIME;
    }

    on_entry() {
        switch (variable('winner')) {
            case TeamEnum.Attacker:
                Broadcast.message([
                    '\n',
                    `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ GAME OVER ] ${FC.Gray}----\n`,
                    `${FC.Bold}${FC.Yellow}Attackers win this game.\n`,
                    `${FC.Bold}${FC.Gray}--------------------`,
                    '\n'
                ]);
                break;
            case TeamEnum.Defender:
                Broadcast.message([
                    '\n',
                    `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ GAME OVER ] ${FC.Gray}----\n`,
                    `${FC.Bold}${FC.Yellow}Defenders win this game.\n`,
                    `${FC.Bold}${FC.Gray}--------------------`,
                    '\n'
                ]);
        }
    }

    on_running() {
        const currentTick = GamePhaseManager.currentTick;
        if (currentTick % 20 == 0) {
            Broadcast.sound("firework.launch", {}, world.getAllPlayers());
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
    let stat = `--- [ Scoreboard ] ---\n`;
    for (const player of MemberManager.getPlayers()) {
        stat += `${player.name} | K:${variable(`${player.name}.kills`)} D:${variable(`${player.name}.deaths`)}\n`;
    }
    Broadcast.message(stat);
}