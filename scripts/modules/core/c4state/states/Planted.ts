import { PhaseManager } from '../../gamephase/PhaseManager';
import { MemberManager } from '../../../player/MemberManager';
import { C4Manager } from '../C4Manager';

import { C4IdleState } from './Idle';
import { C4PlantedPhase } from '../../gamephase/bomb_plant/C4Planted';
import { RoundEndPhase } from '../../gamephase/bomb_plant/RoundEnd';

import { C4StateEnum } from '../C4StateEnum';
import { TeamEnum } from '../../../player/TeamEnum';
import { PhaseEnum as BombPlantPhaseEnum } from '../../gamephase/BombPlantPhaseEnum';

import { set_variable, variable } from '../../../../utils/Variable';
import { HudDriver } from '../../../../ui/hud/drivers/HudDriver';
import { Sound } from '../../../../ui/media/Sound';
import { UiStateManager } from '../../../../ui/hud/state/UiState';
import { Language as L } from '../../../../utils/Language';
import { progressBar } from '../../../../utils/others/Format';

import { Vector3Utils } from '@minecraft/math';
import { VanillaEntityIdentifier } from '@minecraft/server';
import { DimensionLocation, Entity, Player, system, world } from '@minecraft/server';
import { ItemUseBeforeEvent, ItemCompleteUseAfterEvent } from '@minecraft/server';

const DEFUSER_ITEM_ID = 'xblockfire:defuser';
const PLANTED_C4_ENTITY_ID = 'xblockfire:planted_c4' as VanillaEntityIdentifier;
const DEFUSE_RANGE = 1.5;
const DEFUSING_TIME = 6 * 20;
const COUNTDOWN_TIME = 50 * 20;

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

        if (PhaseManager.getPhase().phaseTag === BombPlantPhaseEnum.Action) {
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
                Sound.play('C4_DEFUSING', ev.source, { location, volume });
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
            HudDriver.pushActionbar(player, L.translate('c4.defuse.no_range'), 40, 'c4_status');
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
    Sound.play('C4_EXPLOSION', undefined, { location, volume });

    C4Entity.dimension.createExplosion(C4Entity.location, 20, { causesFire: false, breaksBlocks: false });

    UiStateManager.setRoundEndMessage(TeamEnum.Attacker);
    C4Manager.updateState(new C4IdleState());
}

function defuseComplete(defuser: Player) {
    if (PhaseManager.getPhase().phaseTag === BombPlantPhaseEnum.C4Planted) {
        set_variable(`round_winner`, TeamEnum.Defender);
        UiStateManager.setRoundEndMessage(TeamEnum.Defender);
        PhaseManager.updatePhase(new RoundEndPhase());
    }

    C4Manager.updateState(new C4IdleState());

    const players = MemberManager.getPlayers();
    Sound.play('C4_DEFUSED', players);

    HudDriver.chat(L.translate('round.end.c4_defused', defuser.name), players);
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
        entity.dimension.playSound('xblockfire.c4_beep', location, { volume: 5 });
        try {
            entity.dimension.spawnParticle('minecraft:explosion_particle', location);
        } catch {}
    }
}
