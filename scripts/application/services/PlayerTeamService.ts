import { Player } from "@minecraft/server";
import { MemberManager } from "../../domain/player/MemberManager";

import { lang } from "../../infrastructure/Language";
import { Broadcast } from "../../infrastructure/utils/Broadcast";

import { TeamEnum } from "../../declarations/enum/TeamEnum";

export class PlayerTeamService {
    static selectTeam(executer: Player, team: TeamEnum): ServiceReturnType<number> {
        
        if (executer === undefined || !(executer instanceof Player)) {
            return { ret: 1, message: lang('command.select_team.fail.wrong_executer') };
        }
        
        if (!Object.values<string>(TeamEnum).includes(team)) {
            return { ret: 1, message: lang('command.select_team.fail.unknown_team', team) };
        }

        MemberManager.setPlayerTeam(executer, team as TeamEnum);
        Broadcast.message(lang('game.broadcast.player_select_team', executer.name, team));
        return { ret: 0, message: lang('command.select_team.success', team) };
    }

    static admin_selectTeam(players: Player[], team: TeamEnum) {
        if (!Object.values<string>(TeamEnum).includes(team)) {
            return { ret: 1, message: lang('command.select_team.fail.unknown_team') };
        }

        for (const p of players) {
            MemberManager.setPlayerTeam(p, team as TeamEnum);
            Broadcast.message(lang('game.broadcast.player_select_team', p.name, team));
            p.sendMessage(lang('command.select_team.success', team));
        }

        return { ret: 0, message: lang('command.admin_select_team.success') };
    }
}