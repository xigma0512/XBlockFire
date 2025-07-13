import { world } from "@minecraft/server";
import { set_entity_dynamic_property, set_entity_native_property } from "./utils/Property";
import { AK47 } from "./base/weapon/actors/item/AK47";
import { M4A4 } from "./base/weapon/actors/item/M4A4";
import { TeamEnum } from "./types/TeamEnum";

world.afterEvents.chatSend.subscribe(ev => {
})