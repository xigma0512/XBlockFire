import { PhaseManager } from "../PhaseManager";
import { MemberManager } from "../../member/MemberManager";
import { C4Manager } from "../../c4state/C4Manager";

import { ActionHud } from "../../../modules/hud/bomb_plant/Action";
import { C4IdleState } from "../../c4state/states/Idle";
import { IdlePhase } from "./Idle";

import { TeamEnum } from "../../../types/TeamEnum";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";

import { Broadcast } from "../../../utils/Broadcast";
import { FormatCode as FC } from "../../../utils/FormatCode";
import { variable } from "../../../utils/Variable";

import { GameMode, world } from "@minecraft/server";

import { Config } from "../../../settings/config";

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
        if (this._currentTick-- % 20 == 0) {
            Broadcast.sound("firework.launch", {}, world.getAllPlayers());
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
    let stat = `--- [ Scoreboard ] ---\n`;
    for (const player of MemberManager.getPlayers()) {
        stat += `${player.name} | K:${variable(`${player.name}.kills`)} D:${variable(`${player.name}.deaths`)}\n`;
    }
    Broadcast.message(stat);
}