import { Container, ItemLockMode, world } from "@minecraft/server"

import { BombPlant as Config } from "../../settings/config";

const CONTAINER_LOCATION = Config.uncommon_items.location;
const ITEMS = Config.uncommon_items.items;

export class UnCommonItems {
    private static container: Container | undefined;
    static getItem(type: keyof typeof ITEMS) {
        if (this.container === undefined) {
            const chest = world.getDimension('overworld').getBlock(CONTAINER_LOCATION);
            if (chest === undefined || chest.getComponent('inventory') === undefined) {
                throw Error('Cannot found UnCommonItems container.');
            } 
            this.container = chest.getComponent('inventory')!.container!;
        }

        const item = this.container.getItem(ITEMS[type])?.clone();
        if (item === undefined) {
            throw Error(`${type} item is undefined`);
        }
        item.lockMode = ItemLockMode.slot;
        return item;
    }
}