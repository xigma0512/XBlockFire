import { world, HudElement, system } from "@minecraft/server";
import { Language as L } from "../../utils/Language";

world.afterEvents.playerSpawn.subscribe((ev) => {
    if (ev.initialSpawn) {
        ev.player.onScreenDisplay.setHudVisibility(0, [
            HudElement.Armor,
            HudElement.AirBubbles,
            HudElement.StatusEffects,
            HudElement.Hunger,
            HudElement.ItemText
        ]);
        ev.player.camera.setCamera('minecraft:first_person');
        system.runTimeout(() => {
            ev.player.sendMessage(L.translateWithPrefix("prestart.suggest_settings"));
            ev.player.sendMessage(L.translateWithPrefix("prestart.camera_shake"));
            ev.player.sendMessage(L.translateWithPrefix("prestart.fov_adjust"));
            ev.player.playSound('note.bell');
        }, 100);
    }
});
