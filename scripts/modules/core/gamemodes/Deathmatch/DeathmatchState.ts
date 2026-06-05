import { Player } from '@minecraft/server';
import { TeamEnum } from '../../../player/TeamEnum';
import { reset_variables, set_variable, variable } from '../../../../utils/Variable';

const ATTACKER_SCORE = 'attacker_score';
const DEFENDER_SCORE = 'defender_score';
const WINNER = 'winner';
const SUDDEN_DEATH = 'deathmatch_sudden_death';

export class DeathmatchState {
    static reset(players: Player[]) {
        reset_variables();
        set_variable(ATTACKER_SCORE, 0);
        set_variable(DEFENDER_SCORE, 0);
        set_variable(WINNER, TeamEnum.Spectator);
        set_variable(SUDDEN_DEATH, false);

        for (const player of players) {
            set_variable(this.killsKey(player.name), 0);
            set_variable(this.deathsKey(player.name), 0);
        }
    }

    static getScores() {
        return {
            attacker: (variable(ATTACKER_SCORE) as number | undefined) ?? 0,
            defender: (variable(DEFENDER_SCORE) as number | undefined) ?? 0,
        };
    }

    static addTeamScore(team: TeamEnum) {
        if (team === TeamEnum.Attacker) {
            set_variable(ATTACKER_SCORE, this.getScores().attacker + 1);
            return;
        }

        if (team === TeamEnum.Defender) {
            set_variable(DEFENDER_SCORE, this.getScores().defender + 1);
        }
    }

    static setWinner(team: TeamEnum.Attacker | TeamEnum.Defender) {
        set_variable(WINNER, team);
    }

    static getWinner() {
        return variable(WINNER) as TeamEnum;
    }

    static isSuddenDeath() {
        return Boolean(variable(SUDDEN_DEATH));
    }

    static startSuddenDeath() {
        set_variable(SUDDEN_DEATH, true);
    }

    static getKills(playerName: string) {
        return (variable(this.killsKey(playerName)) as number | undefined) ?? 0;
    }

    static getDeaths(playerName: string) {
        return (variable(this.deathsKey(playerName)) as number | undefined) ?? 0;
    }

    private static killsKey(playerName: string) {
        return `${playerName}.kills`;
    }

    private static deathsKey(playerName: string) {
        return `${playerName}.deaths`;
    }
}
