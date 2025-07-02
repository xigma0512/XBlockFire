import { system, world } from "@minecraft/server";

world.afterEvents.chatSend.subscribe(ev => {
})

world.afterEvents.worldLoad.subscribe(() => {
    system.runInterval(() => {
        const players = world.getPlayers({
            propertyOptions: [
                {
                    propertyId: 'player:is_holding_gun',
                    value: true
                }
            ]
        });
        
        for (const player of players) {
            player.onScreenDisplay.setActionBar('123')
        }
    })
})