import { world, HudElement, system } from '@minecraft/server';
import { Language as L } from '../../utils/Language';
import { FormatCode as FC } from '../../utils/FormatCode';
import { Sound } from '../../ui/media/Sound';

world.afterEvents.playerSpawn.subscribe((ev) => {
    if (ev.initialSpawn) {
        ev.player.onScreenDisplay.setHudVisibility(0, [
            HudElement.Armor,
            HudElement.AirBubbles,
            HudElement.StatusEffects,
            HudElement.Hunger,
            HudElement.ItemText,
        ]);
        ev.player.camera.setCamera('minecraft:first_person');
        system.runTimeout(() => {
            ev.player.sendMessage(FC.Yellow + L.translate('prestart.suggest_settings'));
            ev.player.sendMessage(L.translate('prestart.camera_shake', FC.Green));
            ev.player.sendMessage(L.translate('prestart.fov_adjust', FC.Red));
            Sound.playTo('note.bell', ev.player);
        }, 200);
    }
});
