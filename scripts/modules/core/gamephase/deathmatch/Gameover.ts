import { GameMode, world } from '@minecraft/server';

import { PhaseManager } from '../PhaseManager';

import { DeathmatchConfig } from '../../gamemodes/Deathmatch/DeathmatchConfig';
import { DeathmatchState } from '../../gamemodes/Deathmatch/DeathmatchState';
import { DeathmatchPhaseEnum } from './DeathmatchPhaseEnum';
import { DeathmatchIdlePhase } from './Idle';

import { MemberManager } from '../../../player/MemberManager';
import { TeamEnum } from '../../../player/TeamEnum';

import { HudDriver } from '../../../../ui/hud/drivers/HudDriver';
import { UiStateManager } from '../../../../ui/hud/state/UiState';
import { DeathmatchActionView } from '../../../../ui/hud/views/DeathmatchActionView';
import { Sound } from '../../../../ui/media/Sound';

import { set_entity_dynamic_property, set_entity_native_property } from '../../../../utils/Property';

const ROUND_END_SOUND_ID = 'mob.wolf.whine';
const ROUND_WIN_SOUND_ID = 'random.levelup';
const ROUND_LOSE_SOUND_ID = 'respawn_anchor.deplete';

export class DeathmatchGameOverPhase implements IPhaseHandler {
    readonly phaseId = DeathmatchPhaseEnum.Gameover;
    readonly hud: DeathmatchActionView;

    private _currentTick = DeathmatchConfig.GAMEOVER_TIME;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new DeathmatchActionView();
    }

    on_entry() {
        this._currentTick = DeathmatchConfig.GAMEOVER_TIME;
        const winner = DeathmatchState.getWinner();

        Sound.playTo(ROUND_END_SOUND_ID, MemberManager.getPlayers(), { pitch: 0.8, volume: 1 });
        if (winner !== undefined) {
            UiStateManager.setRoundEndMessage(winner, true);
        }

        if (winner === TeamEnum.Attacker) {
            Sound.playTo(ROUND_WIN_SOUND_ID, MemberManager.getPlayers({ team: TeamEnum.Attacker }), {
                pitch: 1.2,
                volume: 1,
            });
            Sound.playTo(ROUND_LOSE_SOUND_ID, MemberManager.getPlayers({ team: TeamEnum.Defender }), {
                pitch: 0.8,
                volume: 1,
            });
        } else if (winner === TeamEnum.Defender) {
            Sound.playTo(ROUND_WIN_SOUND_ID, MemberManager.getPlayers({ team: TeamEnum.Defender }), {
                pitch: 1.2,
                volume: 1,
            });
            Sound.playTo(ROUND_LOSE_SOUND_ID, MemberManager.getPlayers({ team: TeamEnum.Attacker }), {
                pitch: 0.8,
                volume: 1,
            });
        } else {
        }

        showScoreboard();
    }

    on_running() {
        this._currentTick--;
        this.hud.update();
        if (this.currentTick <= 0) PhaseManager.updatePhase(new DeathmatchIdlePhase());
    }

    on_exit() {
        for (const player of MemberManager.getPlayers()) {
            player.setGameMode(GameMode.Adventure);
            player.teleport(world.getDefaultSpawnLocation());
            set_entity_dynamic_property(player, 'player:is_alive', false);
            set_entity_native_property(player, 'player:can_use_item', false);
        }
    }
}

function showScoreboard() {
    let stat = '';
    for (const player of MemberManager.getPlayers()) {
        stat += `${player.name} | K:${DeathmatchState.getKills(player.name)} D:${DeathmatchState.getDeaths(
            player.name
        )}\n`;
    }
    HudDriver.chat(stat);
}
