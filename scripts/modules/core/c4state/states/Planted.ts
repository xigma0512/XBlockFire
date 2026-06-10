import { ExplosionSystem } from '../../../combat/explosion/ExplosionSystem';
import { MemberManager } from '../../../player/MemberManager';
import { PhaseManager } from '../../gamephase/PhaseManager';
import { C4Manager } from '../C4Manager';

import { C4PlantedPhase } from '../../gamephase/bombplant/C4Planted';
import { RoundEndPhase } from '../../gamephase/bombplant/RoundEnd';
import { C4IdleState } from './Idle';

import { TeamEnum } from '../../../player/TeamEnum';
import { PhaseEnum as BombPlantPhaseEnum } from '../../gamephase/bombplant/BombPlantPhaseEnum';
import { C4StateEnum } from '../C4StateEnum';

import { HudDriver } from '../../../../ui/hud/drivers/HudDriver';
import { UiStateManager } from '../../../../ui/hud/state/UiState';
import { Sound } from '../../../../ui/media/Sound';
import { FormatCode as FC } from '../../../../utils/FormatCode';
import { Language as L } from '../../../../utils/Language';
import { progressBar } from '../../../../utils/others/Format';
import { set_variable } from '../../../../utils/Variable';

import { Vector3Utils } from '@minecraft/math';
import { DimensionLocation, Entity, ItemCompleteUseAfterEvent, ItemUseBeforeEvent, Player, system, VanillaEntityIdentifier, world } from '@minecraft/server';

const DEFUSER_ITEM_ID = 'xblockfire:defuser';
const PLANTED_C4_ENTITY_ID = 'xblockfire:planted_c4' as VanillaEntityIdentifier;
const DEFUSE_RANGE = 1.5;
const DEFUSING_TIME = 6 * 20;
const COUNTDOWN_TIME = 50 * 20;
const C4_BEEP_SOUND_ID = 'xblockfire.c4_beep';
const C4_EXPLOSION_SOUND_ID = 'xblockfire.c4_explosion';
const C4_DEFUSED_SOUND_ID = 'xblockfire.c4_defused';
const C4_DEFUSING_SOUND_ID = 'xblockfire.defusing';

export class C4PlantedState implements IC4StateHandler {
    readonly stateTag = C4StateEnum.Planted;

    private _entity!: Entity;
    get entity() {
        return this._entity;
    }

    private currentTick = COUNTDOWN_TIME;

    private beforeItemUseListener = (ev: ItemUseBeforeEvent) => {};
    private afterItemCompleteUseListener = (ev: ItemCompleteUseAfterEvent) => {};

    constructor(private readonly position: DimensionLocation) {}

    on_entry() {
        this.beforeItemUseListener = world.beforeEvents.itemUse.subscribe(this.onBeforeItemUse.bind(this));
        this.afterItemCompleteUseListener = world.afterEvents.itemCompleteUse.subscribe(
            this.onItemCompleteUse.bind(this)
        );
        this._entity = this.position.dimension.spawnEntity(PLANTED_C4_ENTITY_ID, this.position);

        if (PhaseManager.getPhase().phaseId === BombPlantPhaseEnum.Action) {
            PhaseManager.updatePhase(new C4PlantedPhase());
        }
    }

    on_running() {
        playC4Effect(this.currentTick, this.entity);
        this.currentTick--;
        if (this.currentTick <= 0) c4Explosion(this.entity);
    }

    on_exit() {
        world.beforeEvents.itemUse.unsubscribe(this.beforeItemUseListener);
        world.afterEvents.itemCompleteUse.unsubscribe(this.afterItemCompleteUseListener);
        this.entity.remove();
    }

    private onBeforeItemUse(ev: ItemUseBeforeEvent) {
        if (ev.itemStack.typeId !== DEFUSER_ITEM_ID) return;

        if (!MemberManager.includePlayer(ev.source)) return;

        ev.cancel = !canDefuseC4(this.entity, ev.source);

        if (!ev.cancel) {
            system.run(() => {
                const location = ev.source.location;
                const volume = 3;
                Sound.playAt(C4_DEFUSING_SOUND_ID, ev.source.dimension, location, { volume });
            });
            displayDefusingProgress(ev.source);
        }
    }

    private onItemCompleteUse(ev: ItemCompleteUseAfterEvent) {
        if (ev.itemStack.typeId !== DEFUSER_ITEM_ID) return;
        if (!MemberManager.includePlayer(ev.source)) return;

        defuseComplete(ev.source);
    }
}

function canDefuseC4(C4Entity: Entity, player: Player) {
    const distance = Vector3Utils.distance(player.location, C4Entity.location);
    if (distance > DEFUSE_RANGE) {
        system.run(() => {
            const text = FC.Red + L.translate('c4.defuse.no_range');
            HudDriver.pushActionbar(player, text, 40, 'c4_status');
        });
        return false;
    }

    return true;
}

function displayDefusingProgress(source: Player) {
    let currentTime = DEFUSING_TIME;
    const taskId = system.runInterval(() => {
        const progress = progressBar(DEFUSING_TIME, currentTime--, 30);
        HudDriver.pushActionbar(source, progress, 2, 'c4_status');
    });
    system.run(() => {
        const callback = world.afterEvents.itemStopUse.subscribe((ev) => {
            if (ev.source.id !== source.id) return;
            system.clearRun(taskId);
            world.afterEvents.itemStopUse.unsubscribe(callback);
        });
    });
}

function c4Explosion(C4Entity: Entity) {
    const location = C4Entity.location;
    const volume = 3;
    Sound.playAt(C4_EXPLOSION_SOUND_ID, C4Entity.dimension, location, { volume });

    ExplosionSystem.explode({
        dimension: C4Entity.dimension,
        location: C4Entity.location,
        radius: 20,
        maxDamage: 999,
        minDamage: 40,
        source: C4Entity,
        particleType: 'minecraft:huge_explosion_emitter',
        particleCount: 6,
        obstacleBlocked: false,
    });

    UiStateManager.setRoundEndMessage(TeamEnum.Attacker);
    C4Manager.updateState(new C4IdleState());
}

function defuseComplete(defuser: Player) {
    if (PhaseManager.getPhase().phaseId === BombPlantPhaseEnum.C4Planted) {
        set_variable(`round_winner`, TeamEnum.Defender);
        UiStateManager.setRoundEndMessage(TeamEnum.Defender);
        PhaseManager.updatePhase(new RoundEndPhase());
    }

    C4Manager.updateState(new C4IdleState());

    const players = MemberManager.getPlayers();
    Sound.playTo(C4_DEFUSED_SOUND_ID, players);
}

let soundPlayInterval = 20;
function playC4Effect(currentTick: number, entity: Entity) {
    const totalTime = COUNTDOWN_TIME;

    const bar = progressBar(totalTime, currentTick, 30);
    entity.nameTag = `| ${bar} |`;

    if (currentTick > totalTime * (1 / 2)) soundPlayInterval = 20;
    else if (currentTick > totalTime * (1 / 3)) soundPlayInterval = 10;
    else if (currentTick > totalTime * (1 / 6)) soundPlayInterval = 5;
    else soundPlayInterval = 3;

    const location = Vector3Utils.add(entity.location, { y: 0.3 });

    if (currentTick % soundPlayInterval === 0) {
        Sound.playAt(C4_BEEP_SOUND_ID, entity.dimension, location, { volume: 5 });
        try {
            entity.dimension.spawnParticle('minecraft:explosion_particle', location);
        } catch {}
    }
}
