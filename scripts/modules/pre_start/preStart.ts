import { Difficulty, HudElement, HudVisibility, world } from "@minecraft/server";

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
            HudElement.AirBubbles
        ]);
    }
});