import { world } from "@minecraft/server"

const containerLocation = { x: 281, y: 79, z: 489 }

const itemList = {
    'defender_helmet': 0,
    'defender_chestplate': 1,
    'defender_leggings': 2,
    'defender_boots': 3,

    'attacker_helmet': 4,
    'attacker_chestplate': 5,
    'attacker_leggings': 6,
    'attacker_boots': 7,
}

export class UnCommonItems {
    static getItem(type: keyof typeof itemList) {
        const chest = world.getDimension('overworld').getBlock(containerLocation);
        if (chest === undefined || chest.getComponent('inventory') === undefined) {
            throw Error('Cannot found UnCommonItems container.');
        } 
        const container = chest.getComponent('inventory')!.container!;
        return container.getItem(itemList[type])!;
    }
}