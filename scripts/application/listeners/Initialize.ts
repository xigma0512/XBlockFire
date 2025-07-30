import { Difficulty, HudElement, HudVisibility, system, world } from "@minecraft/server";

import { lang } from "../../infrastructure/Language";

world.afterEvents.worldLoad.subscribe(() => {
    world.gameRules.keepInventory = true;
    world.gameRules.locatorBar = false;
    world.gameRules.fallDamage = false;
    world.gameRules.pvp = true;
    world.gameRules.showDeathMessages = false;
    world.gameRules.doMobSpawning = false;
    world.gameRules.doImmediateRespawn = true;
    world.setDifficulty(Difficulty.Hard);
});

world.afterEvents.playerSpawn.subscribe(ev => {
    if (ev.initialSpawn) {
        ev.player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, [
            HudElement.ItemText,
            HudElement.Armor,
            HudElement.AirBubbles,
            HudElement.StatusEffects,
            HudElement.Hunger
        ]);
        ev.player.camera.setCamera('minecraft:first_person');
        system.runTimeout(() => {
            ev.player.sendMessage(lang('player.recommand_setting.1'));
            ev.player.sendMessage(lang('player.recommand_setting.2'));
            ev.player.sendMessage(lang('player.recommand_setting.3'));
            ev.player.playSound('note.bell');
        }, 100);
    }
});