import { GameRoomManager } from "../../gameroom/GameRoom";
import { HudTextController } from "../../../modules/hud/HudTextController";

import { C4IdleState } from "./Idle";

import { C4PlantedPhase } from "../../gamephase/bomb_plant/C4Planted";
import { RoundEndPhase } from "../../gamephase/bomb_plant/RoundEnd";

import { C4StateEnum } from "../../../types/bombstate/C4StateEnum";
import { TeamEnum } from "../../../types/TeamEnum";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";

import { set_variable, variable } from "../../../utils/Variable";
import { Broadcast } from "../../../utils/Broadcast";
import { FormatCode as FC } from "../../../utils/FormatCode";
import { progressBar } from "../../../utils/others/Format";
import { Config as BP_Config } from "../../gamephase/bomb_plant/_config";

import { Vector3Utils } from "@minecraft/math";
import { VanillaEntityIdentifier } from "@minecraft/server";
import { DimensionLocation, Entity, Player, system, world } from "@minecraft/server";
import { ItemUseBeforeEvent, ItemCompleteUseAfterEvent } from "@minecraft/server"

const DEFUSER_ITEM_ID = 'xblockfire:defuser';
const PLANTED_C4_ENTITY_ID = 'xblockfire:planted_c4' as VanillaEntityIdentifier;
const DEFUSE_RANGE = 1.5;
const DEFUSING_TIME = 5 * 20;

const EXPLOSION_SOUND_ID = 'xblockfire.c4_explosion';
const COMPLETE_DEFUSED_SOUND_ID = 'xblockfire.c4_defused';
const DEFUSING_SOUND_ID = 'xblockfire.defusing';

export class C4PlantedState implements IC4StateHandler {

    readonly stateTag = C4StateEnum.Planted;
    
    private entity!: Entity;
    private currentTick = BP_Config.C4planted.COUNTDOWN_TIME;

    private beforeItemUseListener = (ev: ItemUseBeforeEvent) => { };
    private afterItemCompleteUseListener = (ev: ItemCompleteUseAfterEvent) => { };

    constructor(
        private readonly roomId: number,
        private readonly position: DimensionLocation
    ) { }

    on_entry() {
        this.beforeItemUseListener = world.beforeEvents.itemUse.subscribe(this.onBeforeItemUse.bind(this));
        this.afterItemCompleteUseListener = world.afterEvents.itemCompleteUse.subscribe(this.onItemCompleteUse.bind(this));
        this.entity = this.position.dimension.spawnEntity(PLANTED_C4_ENTITY_ID, this.position);
        
        const room = GameRoomManager.getRoom(this.roomId);
        if (room.phaseManager.getPhase().phaseTag === BombPlantPhaseEnum.Action) {
            room.phaseManager.updatePhase(new C4PlantedPhase(this.roomId));
        }

        const siteIndex = String.fromCharCode(65 + (variable(`${this.roomId}.c4.plant_site_index`) ?? 0));
        Broadcast.message(`${FC.Gray}>> ${FC.Bold}${FC.MinecoinGold}C4 HAS BEEN PLANTED AT SITE ${siteIndex}.` ,room.memberManager.getPlayers());
        
        console.warn(`[Room ${this.roomId}] Entry C4Planted state.`);
    }
    
    on_running() {
        playC4Effect(this.currentTick, this.entity);
        this.currentTick --;
        if (this.currentTick <= 0) c4Explosion(this.roomId, this.entity);
    }

    on_exit() {
        world.beforeEvents.itemUse.unsubscribe(this.beforeItemUseListener);
        world.afterEvents.itemCompleteUse.unsubscribe(this.afterItemCompleteUseListener);

        this.entity.remove();

        console.warn(`[Room ${this.roomId}] Exit C4Planted state.`);
    }


    private onBeforeItemUse(ev: ItemUseBeforeEvent) {
        if (ev.itemStack.typeId !== DEFUSER_ITEM_ID) return;

        const room = GameRoomManager.getRoom(this.roomId);
        if (!room.memberManager.includePlayer(ev.source)) return;
        
        ev.cancel = !canDefuseC4(this.entity, ev.source);

        if (!ev.cancel) {
            system.run(() => {
                const location = ev.source.location;
                const volume = 3;
                Broadcast.sound(DEFUSING_SOUND_ID, { location, volume });
            });
            displayDefusingProgress(ev.source);
        }
    }

    private onItemCompleteUse(ev: ItemCompleteUseAfterEvent) {
        if (ev.itemStack.typeId !== DEFUSER_ITEM_ID) return;

        const room = GameRoomManager.getRoom(this.roomId);
        if (!room.memberManager.includePlayer(ev.source)) return;

        defuseComplete(this.roomId, ev.source);
    }

}

function canDefuseC4(C4Entity: Entity, player: Player) {
    const distance = Vector3Utils.distance(player.location, C4Entity.location);
    if (distance > DEFUSE_RANGE) {
        system.run(() => {
            HudTextController.add(player, 'actionbar', `${FC.Red}There is no c4 in the range.`);
        });
        return false;
    }

    return true;
}

function displayDefusingProgress(source: Player) {
    let currentTime = DEFUSING_TIME;
    const taskId = system.runInterval(() => {
        const progress = progressBar(DEFUSING_TIME, currentTime--, 30);
        HudTextController.add(source, 'actionbar', progress);
    });
    system.run(() => {
        const callback = world.afterEvents.itemStopUse.subscribe(ev => {
            if (ev.source.id !== source.id) return;
            system.clearRun(taskId);
            world.afterEvents.itemStopUse.unsubscribe(callback);
        })
    })
}

function c4Explosion(roomId: number, C4Entity: Entity) {
    const location = C4Entity.location;
    const volume = 3;
    Broadcast.sound(EXPLOSION_SOUND_ID, { location, volume });
    
    C4Entity.dimension.createExplosion(C4Entity.location, 20, { causesFire: false, breaksBlocks: false });    

    const room = GameRoomManager.getRoom(roomId);
    room.C4Manager.updateState(new C4IdleState(roomId));
}

function defuseComplete(roomId: number, defuser: Player) {
    const room = GameRoomManager.getRoom(roomId);
    
    if (room.phaseManager.getPhase().phaseTag === BombPlantPhaseEnum.C4Planted) {
        set_variable(`${roomId}.round_winner`, TeamEnum.Defender);
        room.phaseManager.updatePhase(new RoundEndPhase(roomId));
    }

    room.C4Manager.updateState(new C4IdleState(roomId));

    const players = room.memberManager.getPlayers();
    Broadcast.sound(COMPLETE_DEFUSED_SOUND_ID, {}, players);
    Broadcast.message(`${FC.Gray}>> ${FC.Green}C4 has been defused by ${defuser.name}.`, players);
}

let soundPlayInterval = 20;
function playC4Effect(currentTick: number, entity: Entity) {
    const totalTime = BP_Config.C4planted.COUNTDOWN_TIME;

    const bar = progressBar(totalTime, currentTick, 30);
    entity.nameTag = `| ${bar} |`;

    if (currentTick > totalTime * (1/2)) soundPlayInterval = 20;
    else if (currentTick > totalTime * (1/3)) soundPlayInterval = 10;
    else if (currentTick > totalTime * (1/6)) soundPlayInterval = 5;
    else soundPlayInterval = 3;

    const location = Vector3Utils.add(entity.location, { y: 0.3 });

    if (currentTick % soundPlayInterval === 0) {
        entity.dimension.playSound("block.click", location, { pitch: 1.5, volume: 5 });
        try { entity.dimension.spawnParticle("minecraft:explosion_particle", location); } catch { }
    }
}