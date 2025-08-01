import { Player } from "@minecraft/server";

import { EconomyManager } from "../../../economy/EconomyManager";
import { C4PlantedPhase } from "../../gamephase/bomb_plant/C4Planted";
import { GamePhaseManager } from "../../gamephase/GamePhaseManager";
import { MemberManager } from "../../../player/MemberManager";

import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { lang } from "../../../../infrastructure/Language";

import { BombPlantPhaseEnum } from "../../../../declarations/enum/PhaseEnum";
import { TeamEnum } from "../../../../declarations/enum/TeamEnum";

const C4_PLANTED_SOUND = 'xblockfire.c4_planted';

export class PlantedC4SuccessStrategy implements IBombStateStrategy {
    
    constructor(private source: Player, private site: number) {
    }

    initialize() {
        updateGamePhase();
        clearC4Item(this.source);
        broadcastInfomations(this.site);
        sendPlantReward();
    }

    dispose() { }
}

function updateGamePhase() {
    const currentPhase = GamePhaseManager.phaseHandler;
    if (currentPhase.phaseTag !== BombPlantPhaseEnum.Action) {
        GamePhaseManager.updatePhase(new C4PlantedPhase());
    }
}

function clearC4Item(source: Player) {
    // eslint-disable-next-line
    source.runCommand('clear @s xblockfire:c4');
}

function broadcastInfomations(site: number) {
    Broadcast.sound(C4_PLANTED_SOUND, {});
    const siteIndex = String.fromCharCode(65 + site);
    Broadcast.message(lang('c4.bomb_has_been_planted.broadcast', siteIndex));
}

function sendPlantReward() {
    for (const player of MemberManager.getPlayers({team: TeamEnum.Attacker})) {
        EconomyManager.setMoney(player, EconomyManager.getMoney(player) + 300);
        player.sendMessage(lang('c4.plant_reward'));
    }
}