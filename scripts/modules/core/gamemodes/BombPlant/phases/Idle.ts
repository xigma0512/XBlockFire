import { MemberManager } from '../../../../player/MemberManager';
import { LoadoutManager } from '../../../LoadoutManager';
import { PhaseManager } from '../../../gamephase/PhaseManager';
import { HotbarManager, HotbarTemplate } from '../../../../../ui/hotbar/Hotbar';
import { WaitingView as WaitingHud } from '../../../../../ui/hud/views/WaitingView';

import { BuyingPhase } from './Buying';

import { PhaseEnum as BombPlantPhaseEnum } from './BombPlantPhaseEnum';
import { TeamEnum } from '../../../../player/TeamEnum';

import { Language as L } from '../../../../../utils/Language';
import { reset_variables, set_variable } from '../../../../../utils/Variable';
import { ItemStackFactory } from '../../../../../utils/ItemStackFactory';
import { Sound } from '../../../../../ui/media/Sound';

import { ItemLockMode } from '@minecraft/server';

import { Config } from '../../../../../settings/config';

import { BombPlantConfig } from '../BombPlantConfig';

export class IdlePhase implements IPhaseHandler {
    readonly phaseId = BombPlantPhaseEnum.Idle;
    readonly hud: WaitingHud;

    private _currentTick: number = BombPlantConfig.IDLE_TIME;
    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new WaitingHud();
    }

    on_entry() {
        this._currentTick = BombPlantConfig.IDLE_TIME;
    }

    on_running() {
        const members = MemberManager.getPlayers();
        const playerAmount = members.length;
        const countdownWasIdle = this.currentTick === BombPlantConfig.IDLE_TIME;

        if (playerAmount >= Config.game.AUTO_START_MIN_PLAYER) {
            if (countdownWasIdle) Sound.play('WAITING_COUNTDOWN_START', members);
            this._currentTick--;
        }
        if (this.currentTick !== BombPlantConfig.IDLE_TIME && playerAmount < Config.game.AUTO_START_MIN_PLAYER) {
            this._currentTick = BombPlantConfig.IDLE_TIME;
            Sound.play('WAITING_COUNTDOWN_CANCEL', members);
        }

        this.hud.update();
        this.transitions();
    }

    on_exit() {
        randomTeam();
        initializePlayers();
        initializeVariable();
    }

    private transitions() {
        if (this.currentTick <= 0) return PhaseManager.updatePhase(new BuyingPhase());
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
        HotbarManager.sendHotbar(player, HotbarTemplate.initSpawn());
    }

    for (const player of MemberManager.getPlayers({ team: TeamEnum.Defender })) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        hotbar.items[3] = ItemStackFactory.new({ typeId: 'xblockfire:defuser', lockMode: ItemLockMode.slot });
        HotbarManager.sendHotbar(player, hotbar);
    }
}

function initializeVariable() {
    reset_variables();
    set_variable(`attacker_score`, 0);
    set_variable(`defender_score`, 0);
    for (const player of MemberManager.getPlayers()) {
        set_variable(`${player.name}.kills`, 0);
        set_variable(`${player.name}.deaths`, 0);
    }
}
