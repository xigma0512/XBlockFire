import { Entity, ItemStack, world } from "@minecraft/server"
import { GrenadeTypeEnum, GunReloadStateEnum, TeamTagEnum } from "../modules/weapon/types/Enums"

type WorldPropertyList = {
}

type EntityDynamicPropertyList = {
    'item:uuid': string,
    'player:team': TeamTagEnum;
    'player:is_alive': boolean;
}

type ScoreBoardPropertyList = {
}

type EntityNativePropertyList = {
    'player:is_moving': boolean;
    'player:state.reload': GunReloadStateEnum;
    'grenade:throwing_type': number;
    'grenade:type': GrenadeTypeEnum;
}

type WorldPropertyId = keyof WorldPropertyList;
type EntityDynamicPropertyId = keyof EntityDynamicPropertyList;
type ScoreBoardPropertyId = keyof ScoreBoardPropertyList;
type EntityNativePropertyId = keyof EntityNativePropertyList;

function world_property<T extends WorldPropertyId>(name: T) {
    return world.getDynamicProperty(name) as WorldPropertyList[T];
}

function set_world_property<T extends WorldPropertyId>(name: T, value: WorldPropertyList[T]) {
    world.setDynamicProperty(name, value);
}

function entity_dynamic_property<T extends EntityDynamicPropertyId>(entity: Entity | ItemStack, name: T) {
    return entity.getDynamicProperty(name) as EntityDynamicPropertyList[T];
}

function set_entity_dynamic_property<T extends EntityDynamicPropertyId>(entity: Entity | ItemStack, name: T, value: EntityDynamicPropertyList[T]) {
    entity.setDynamicProperty(name, value);
}

function scoreboard_property<T extends ScoreBoardPropertyId>(entity: Entity, name: T) {
    if (world.scoreboard.getObjective(name) === undefined) world.scoreboard.addObjective(name);

    const scoreboard = world.scoreboard.getObjective(name);
    try { return scoreboard!.getScore(entity) as ScoreBoardPropertyList[T]; }
    catch { return 0; }
}

function set_scoreboard_property<T extends ScoreBoardPropertyId>(entity: Entity, name: T, value: ScoreBoardPropertyList[T]) {
    if (world.scoreboard.getObjective(name) === undefined) world.scoreboard.addObjective(name);

    const scoreboard = world.scoreboard.getObjective(name);
    scoreboard!.setScore(entity, Number(value));
}

function entity_native_property<T extends EntityNativePropertyId>(entity: Entity, name: T) {
    return entity.getProperty(name) as EntityNativePropertyList[T];
}

function set_entity_native_property<T extends EntityNativePropertyId>(entity: Entity, name: T, value: EntityNativePropertyList[T]) {
    entity.setProperty(name, value);
}

export { 
    world_property, set_world_property, 
    entity_dynamic_property, set_entity_dynamic_property, 
    scoreboard_property, set_scoreboard_property,
    entity_native_property, set_entity_native_property
};