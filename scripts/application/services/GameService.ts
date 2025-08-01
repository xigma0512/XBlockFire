import { system } from "@minecraft/server";

import { gameroom } from "../../domain/gameroom/GameRoom";
import { PreRoundStartPhase } from "../../domain/fsm/gamephase/bomb_plant/PreRoundStart";
import { GamePhaseManager } from "../../domain/fsm/gamephase/GamePhaseManager";

import { lang } from "../../infrastructure/Language";
import { Broadcast } from "../../infrastructure/utils/Broadcast";

import { GameModeEnum } from "../../declarations/enum/GameModeEnum";

export class GameService {
    static startGame(): ServiceReturnType<number> {
        system.run(() => {
            const gameMode = gameroom().gameMode;
            const gamestartPhase = {
                [GameModeEnum.BombPlant]: new PreRoundStartPhase
            };
            GamePhaseManager.updatePhase(gamestartPhase[gameMode]);
            Broadcast.message(lang('game.broadcast.gamestart'));
        });

        return { ret: 0, message: lang('command.forcestart.success') };
    }
}