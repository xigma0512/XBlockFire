import { GameMode, world } from '@minecraft/server';

import { PhaseManager } from '../../../gamephase/PhaseManager';

import { DeathmatchPhaseEnum } from './DeathmatchPhaseEnum';
import { DeathmatchIdlePhase } from './Idle';
import { DeathmatchConfig } from '../DeathmatchConfig';
import { DeathmatchState } from '../DeathmatchState';

import { MemberManager } from '../../../../player/MemberManager';
import { TeamEnum } from '../../../../player/TeamEnum';

import { DeathmatchActionView } from '../../../../../ui/hud/views/DeathmatchActionView';
import { HudDriver } from '../../../../../ui/hud/drivers/HudDriver';
import { UiStateManager } from '../../../../../ui/hud/state/UiState';
import { Sound } from '../../../../../ui/media/Sound';

import { Language as L } from '../../../../../utils/Language';
import { set_entity_dynamic_property, set_entity_native_property } from '../../../../../utils/Property';

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

        Sound.play('ROUND_END', MemberManager.getPlayers());
        if (winner !== undefined) {
            UiStateManager.setRoundEndMessage(winner, true);
        }

        if (winner === TeamEnum.Attacker) {
            Sound.play('ROUND_WIN', MemberManager.getPlayers({ team: TeamEnum.Attacker }), {});
            Sound.play('ROUND_LOSE', MemberManager.getPlayers({ team: TeamEnum.Defender }), {});
        } else if (winner === TeamEnum.Defender) {
            Sound.play('ROUND_WIN', MemberManager.getPlayers({ team: TeamEnum.Defender }), {});
            Sound.play('ROUND_LOSE', MemberManager.getPlayers({ team: TeamEnum.Attacker }), {});
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
