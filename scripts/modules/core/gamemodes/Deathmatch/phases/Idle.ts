import { MemberManager } from '../../../../player/MemberManager';
import { LoadoutManager } from '../../../LoadoutManager';
import { PhaseManager } from '../../../gamephase/PhaseManager';
import { WaitingView as WaitingHud } from '../../../../../ui/hud/views/WaitingView';
import { DeathmatchPreStartPhase } from './PreStart';
import { PhaseIdentity } from '../../../gamephase/PhaseIdentity';
import { TeamEnum } from '../../../../player/TeamEnum';
import { Language as L } from '../../../../../utils/Language';
import { reset_variables, set_variable } from '../../../../../utils/Variable';
import { Sound } from '../../../../../ui/media/Sound';
import { Config } from '../../../../../settings/config';

const COUNTDOWN_TIME = 20 * 20;

export class DeathmatchIdlePhase implements IPhaseHandler {
    readonly phaseTag = 100;
    readonly phaseId = PhaseIdentity.Deathmatch.Idle;
    readonly hud: WaitingHud;

    private _currentTick = COUNTDOWN_TIME;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new WaitingHud();
    }

    on_entry() {
        this._currentTick = COUNTDOWN_TIME;
    }

    on_running() {
        const members = MemberManager.getPlayers();
        const countdownWasIdle = this.currentTick === COUNTDOWN_TIME;

        if (members.length >= Config.game.AUTO_START_MIN_PLAYER) {
            if (countdownWasIdle) Sound.play('WAITING_COUNTDOWN_START', members);
            this._currentTick--;
        }

        if (this.currentTick !== COUNTDOWN_TIME && members.length < Config.game.AUTO_START_MIN_PLAYER) {
            this._currentTick = COUNTDOWN_TIME;
            Sound.play('WAITING_COUNTDOWN_CANCEL', members);
        }

        this.hud.update();
        if (this.currentTick <= 0) PhaseManager.updatePhase(new DeathmatchPreStartPhase());
    }

    on_exit() {
        randomTeam();
        initializePlayers();
        initializeVariables();
    }
}

function randomTeam() {
    const players = MemberManager.getPlayers();
    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());

    let attackTeamCount = 0;
    let defenderTeamCount = 0;
    for (const player of shuffledPlayers) {
        if (attackTeamCount <= defenderTeamCount) {
            MemberManager.setPlayerTeam(player, TeamEnum.Attacker);
            attackTeamCount++;
            player.sendMessage(L.translate('game.assigned.attacker'));
        } else {
            MemberManager.setPlayerTeam(player, TeamEnum.Defender);
            defenderTeamCount++;
            player.sendMessage(L.translate('game.assigned.defender'));
        }
    }
}

function initializePlayers() {
    for (const player of MemberManager.getPlayers()) {
        LoadoutManager.initializePlayer(player);
    }
}

function initializeVariables() {
    reset_variables();
    set_variable('attacker_score', 0);
    set_variable('defender_score', 0);
    set_variable('winner', TeamEnum.Spectator);
    set_variable('deathmatch_sudden_death', false);
    for (const player of MemberManager.getPlayers()) {
        set_variable(`${player.name}.kills`, 0);
        set_variable(`${player.name}.deaths`, 0);
    }
}
