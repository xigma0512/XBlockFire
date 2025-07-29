import { FormatCode as FC } from "../shared/utils/FormatCode";
import { Difficulty, HudElement, HudVisibility, system, world } from "@minecraft/server";

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
            ev.player.sendMessage(`${FC.Gray}>> ${FC.Yellow}建議設定`);
            ev.player.sendMessage(`${FC.Gray}>> ${FC.White}設定->視訊->相機晃動${FC.Green}(開啟)`);
            ev.player.sendMessage(`${FC.Gray}>> ${FC.White}設定->視訊->視野可透過遊戲控制調整${FC.Red}(關閉)`);
            ev.player.playSound('note.bell');
        }, 100);
    }
});