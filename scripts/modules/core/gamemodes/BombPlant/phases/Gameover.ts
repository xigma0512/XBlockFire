import { PhaseManager } from '../../../gamephase/PhaseManager';
import { MemberManager } from '../../../../player/MemberManager';
import { C4Manager } from '../c4state/C4Manager';

import { ActionView as ActionHud } from '../../../../../ui/hud/views/ActionView';
import { C4IdleState } from '../c4state/states/Idle';
import { IdlePhase } from './Idle';

import { TeamEnum } from '../../../../player/TeamEnum';
import { PhaseEnum as BombPlantPhaseEnum } from './BombPlantPhaseEnum';

import { HudDriver } from '../../../../../ui/hud/drivers/HudDriver';
import { Sound } from '../../../../../ui/media/Sound';
import { UiStateManager } from '../../../../../ui/hud/state/UiState';
import { Language as L } from '../../../../../utils/Language';
import { variable } from '../../../../../utils/Variable';

import { GameMode, world } from '@minecraft/server';

const COUNTDOWN_TIME = 10 * 20;

export class GameOverPhase implements IPhaseHandler {
    readonly phaseTag = BombPlantPhaseEnum.Gameover;
    readonly hud: ActionHud;
    private _currentTick: number = COUNTDOWN_TIME;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = COUNTDOWN_TIME;
        const winner = variable('winner') as TeamEnum;
        if (winner === TeamEnum.Attacker || winner === TeamEnum.Defender) {
            const langKey = winner === TeamEnum.Attacker ? 'game.over.attacker_win' : 'game.over.defender_win';
            HudDriver.chat(L.translate(langKey));
            UiStateManager.setRoundEndMessage(winner, true);
        }

        Sound.play('ROUND_END', world.getAllPlayers());
    }

    on_running() {
        this._currentTick--;
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
    let stat = '';
    for (const player of MemberManager.getPlayers()) {
        stat += `${player.name} | K:${variable(`${player.name}.kills`)} D:${variable(`${player.name}.deaths`)}\n`;
    }
    HudDriver.chat(stat);
}

