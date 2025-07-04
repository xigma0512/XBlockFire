import { FormatCode } from "../../utils/FormatCode";
import { Player, system } from "@minecraft/server";

interface PlayerHudText {
    sidebar: string[];
    subtitle: string[];
    actionbar: string[];
}

class _HudTextController {

    private static _instance: _HudTextController;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private hud = new Map<Player, PlayerHudText>();
    
    private constructor() {
        this.hud = new Map();
        system.runInterval(this.update.bind(this));
    }

    add(player: Player, type: keyof PlayerHudText, text: string | string[]) {
        if (!this.hud.has(player)) this.initializePlayer(player);
        if (Array.isArray(text)) text = text.join(`\n${FormatCode.Reset}`);
        
        this.hud.get(player)![type].push(text);
    }

    private update() {
        for (const [player, text] of this.hud) {
            if (text.sidebar.length == 0) text.sidebar = ['\u{E107}'];
            try {
                player.onScreenDisplay.setTitle(text.sidebar.join(`\n${FormatCode.Reset}`), {
                    fadeInDuration: 0,
                    fadeOutDuration: 0,
                    stayDuration: 20,
                    subtitle: text.subtitle.join(`\n${FormatCode.Reset}`)
                });
                player.onScreenDisplay.setActionBar(text.actionbar.join(`\n${FormatCode.Reset}`));
            } catch { continue; }
        }
        this.hud.clear();
    }

    private initializePlayer(player: Player) {
        this.hud.set(player, {
            sidebar: [],
            subtitle: [],
            actionbar: []
        });
    }

}

export const HudTextController = _HudTextController.instance;