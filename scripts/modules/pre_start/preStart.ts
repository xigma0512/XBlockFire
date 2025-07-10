import { HudElement, HudVisibility, world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
    world.gameRules.keepInventory = true;
    world.gameRules.locatorBar = false;
    world.gameRules.fallDamage = false;
    world.gameRules.pvp = true;
    world.gameRules.showDeathMessages = false;
});

world.afterEvents.playerSpawn.subscribe(ev => {
    if (ev.initialSpawn) {
        ev.player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, [
            HudElement.ItemText,
            HudElement.Armor
        ]);
    }
});