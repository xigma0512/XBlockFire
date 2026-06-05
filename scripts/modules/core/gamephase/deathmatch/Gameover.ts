import { GameMode, world } from '@minecraft/server';
import { MemberManager } from '../../../player/MemberManager';
import { TeamEnum } from '../../../player/TeamEnum';
import { PhaseIdentity } from '../PhaseIdentity';
import { PhaseManager } from '../PhaseManager';
import { DeathmatchIdlePhase } from './Idle';
import { DeathmatchActionView } from '../../../../ui/hud/views/DeathmatchActionView';
import { HudDriver } from '../../../../ui/hud/drivers/HudDriver';
import { Language as L } from '../../../../utils/Language';
import { variable } from '../../../../utils/Variable';
import { DeathmatchConfig } from '../../deathmatch/DeathmatchConfig';

export class DeathmatchGameOverPhase implements IPhaseHandler {
    readonly phaseTag = 103;
    readonly phaseId = PhaseIdentity.Deathmatch.Gameover;
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
        const winner = variable('winner') as TeamEnum;
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
        for (const player of world.getAllPlayers()) {
            player.setGameMode(GameMode.Adventure);
            player.teleport(world.getDefaultSpawnLocation());
        }
    }
}

function showScoreboard() {
    let stat = '';
    for (const player of MemberManager.getPlayers()) {
        stat += `${player.name} | K:${variable(`${player.name}.kills`) || 0} D:${
            variable(`${player.name}.deaths`) || 0
        }\n`;
    }
    HudDriver.chat(stat);
}
