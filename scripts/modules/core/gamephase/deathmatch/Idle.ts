import { Config } from '../../../../settings/config';
import { WaitingView as WaitingHud } from '../../../../ui/hud/views/WaitingView';
import { Sound } from '../../../../ui/media/Sound';
import { Language as L } from '../../../../utils/Language';
import { MemberManager } from '../../../player/MemberManager';
import { TeamEnum } from '../../../player/TeamEnum';
import { DeathmatchState } from '../../gamemodes/Deathmatch/DeathmatchState';
import { LoadoutManager } from '../../LoadoutManager';
import { PhaseManager } from '../PhaseManager';
import { DeathmatchPhaseEnum } from './DeathmatchPhaseEnum';
import { DeathmatchPreStartPhase } from './PreStart';

const COUNTDOWN_TIME = 20 * 20;
const WAITING_COUNTDOWN_START_SOUND_ID = 'random.toast';
const WAITING_COUNTDOWN_CANCEL_SOUND_ID = 'block.false_permissions';

export class DeathmatchIdlePhase implements IPhaseHandler {
    readonly phaseId = DeathmatchPhaseEnum.Idle;
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
            if (countdownWasIdle) Sound.playTo(WAITING_COUNTDOWN_START_SOUND_ID, members, { pitch: 1.2, volume: 1 });
            this._currentTick--;
        }

        if (this.currentTick !== COUNTDOWN_TIME && members.length < Config.game.AUTO_START_MIN_PLAYER) {
            this._currentTick = COUNTDOWN_TIME;
            Sound.playTo(WAITING_COUNTDOWN_CANCEL_SOUND_ID, members, { pitch: 0.8, volume: 1 });
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
    DeathmatchState.reset(MemberManager.getPlayers());
}
