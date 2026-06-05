import { GameMode, world } from '@minecraft/server';
import { MemberManager } from '../../../../player/MemberManager';
import { TeamEnum } from '../../../../player/TeamEnum';
import { DeathmatchPhaseEnum } from './DeathmatchPhaseEnum';
import { PhaseManager } from '../../../gamephase/PhaseManager';
import { DeathmatchIdlePhase } from './Idle';
import { DeathmatchActionView } from '../../../../../ui/hud/views/DeathmatchActionView';
import { HudDriver } from '../../../../../ui/hud/drivers/HudDriver';
import { Language as L } from '../../../../../utils/Language';
import { set_entity_dynamic_property, set_entity_native_property } from '../../../../../utils/Property';
import { DeathmatchConfig } from '../DeathmatchConfig';
import { DeathmatchState } from '../DeathmatchState';

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
        if (winner === TeamEnum.Attacker) HudDriver.chat(L.translate('deathmatch.gameover.attacker_win'));
        if (winner === TeamEnum.Defender) HudDriver.chat(L.translate('deathmatch.gameover.defender_win'));
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
