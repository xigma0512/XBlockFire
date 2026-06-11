import { MemberManager } from '../../../player/MemberManager';
import { setupLobbyPlayer } from '../../../player/LobbyInventory';
import { C4Manager } from '../../c4state/C4Manager';
import { PhaseManager } from '../PhaseManager';

import { ActionView as ActionHud } from '../../../../ui/hud/views/ActionView';
import { C4IdleState } from '../../c4state/states/Idle';
import { IdlePhase } from './Idle';

import { TeamEnum } from '../../../player/TeamEnum';
import { PhaseEnum as BombPlantPhaseEnum } from './BombPlantPhaseEnum';

import { HudDriver } from '../../../../ui/hud/drivers/HudDriver';
import { UiStateManager } from '../../../../ui/hud/state/UiState';
import { Sound } from '../../../../ui/media/Sound';
import { variable } from '../../../../utils/Variable';

import { GameMode, world } from '@minecraft/server';

import { BombPlantConfig } from '../../gamemodes/BombPlant/BombPlantConfig';

const ROUND_END_SOUND_ID = 'mob.wolf.whine';

export class GameOverPhase implements IPhaseHandler {
    readonly phaseId = BombPlantPhaseEnum.Gameover;
    readonly hud: ActionHud;
    private _currentTick: number = BombPlantConfig.GAMEOVER_TIME;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = BombPlantConfig.GAMEOVER_TIME;
        const winner = variable('winner') as TeamEnum;
        if (winner === TeamEnum.Attacker || winner === TeamEnum.Defender) {
            UiStateManager.setRoundEndMessage(winner, true);
        }

        Sound.playTo(ROUND_END_SOUND_ID, world.getAllPlayers(), { pitch: 0.8, volume: 1 });
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
        setupLobbyPlayer(player);
    }
}

function showScoreboard() {
    let stat = '';
    for (const player of MemberManager.getPlayers()) {
        stat += `${player.name} | K:${variable(`${player.name}.kills`)} D:${variable(`${player.name}.deaths`)}\n`;
    }
    HudDriver.chat(stat);
}
