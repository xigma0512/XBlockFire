import { GameMode, Player, system } from '@minecraft/server';
import { MemberManager } from '../../../player/MemberManager';
import { TeamEnum } from '../../../player/TeamEnum';
import { gameroom } from '../../GameRoom';
import { GameModeEnum } from '../../GameModeEnum';
import { PhaseIdentity } from '../PhaseIdentity';
import { PhaseManager } from '../PhaseManager';
import { DeathmatchGameOverPhase } from './Gameover';
import { DeathmatchActionView } from '../../../../ui/hud/views/DeathmatchActionView';
import { HudDriver } from '../../../../ui/hud/drivers/HudDriver';
import { Language as L } from '../../../../utils/Language';
import { set_entity_dynamic_property, entity_dynamic_property } from '../../../../utils/Property';
import { set_variable, variable } from '../../../../utils/Variable';
import { DeathmatchConfig } from '../../deathmatch/DeathmatchConfig';
import { DeathmatchSpawn } from '../../deathmatch/DeathmatchSpawn';
import { DeathmatchLoadout } from '../../deathmatch/DeathmatchLoadout';

export class DeathmatchActionPhase implements IPhaseHandler {
    readonly phaseTag = 102;
    readonly phaseId = PhaseIdentity.Deathmatch.Action;
    readonly hud: DeathmatchActionView;

    private _currentTick = DeathmatchConfig.ACTION_TIME;
    private readonly respawnTasks = new Map<Player, number>();

    get currentTick() {
        return this._currentTick;
    }

    constructor() {
        this.hud = new DeathmatchActionView();
    }

    on_entry() {
        this._currentTick = DeathmatchConfig.ACTION_TIME;
    }

    on_running() {
        if (!variable('deathmatch_sudden_death')) this._currentTick--;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        for (const taskId of this.respawnTasks.values()) system.clearRun(taskId);
        this.respawnTasks.clear();
    }

    queueRespawn(player: Player) {
        if (this.respawnTasks.has(player)) return;

        const taskId = system.runTimeout(() => {
            this.respawnTasks.delete(player);
            this.respawn(player);
        }, DeathmatchConfig.RESPAWN_DELAY);
        this.respawnTasks.set(player, taskId);
    }

    private respawn(player: Player) {
        if (!player.isValid) return;
        if (gameroom().gameMode !== GameModeEnum.Deathmatch) return;
        if (PhaseManager.getPhase() !== this) return;
        if (!MemberManager.includePlayer(player)) return;
        if (entity_dynamic_property(player, 'player:is_alive')) return;

        const team = MemberManager.getPlayerTeam(player);
        if (team !== TeamEnum.Attacker && team !== TeamEnum.Defender) return;

        player.teleport(DeathmatchSpawn.randomSpawn(team));
        player.setGameMode(GameMode.Adventure);
        set_entity_dynamic_property(player, 'player:is_alive', true);
        player.addEffect('regeneration', 40, { amplifier: 255, showParticles: false });
        player.addEffect('saturation', 20, { amplifier: 5, showParticles: false });
        DeathmatchLoadout.apply(player);
    }

    private transitions() {
        const attackerScore = variable('attacker_score') || 0;
        const defenderScore = variable('defender_score') || 0;

        if (attackerScore >= DeathmatchConfig.WINNING_SCORE) return this.finish(TeamEnum.Attacker);
        if (defenderScore >= DeathmatchConfig.WINNING_SCORE) return this.finish(TeamEnum.Defender);

        if (this.currentTick > 0) return;
        if (attackerScore > defenderScore) return this.finish(TeamEnum.Attacker);
        if (defenderScore > attackerScore) return this.finish(TeamEnum.Defender);

        if (!variable('deathmatch_sudden_death')) {
            set_variable('deathmatch_sudden_death', true);
            HudDriver.chat(L.translate('deathmatch.sudden_death'));
        }
    }

    private finish(winner: TeamEnum.Attacker | TeamEnum.Defender) {
        set_variable('winner', winner);
        PhaseManager.updatePhase(new DeathmatchGameOverPhase());
    }
}
