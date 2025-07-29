import { Container, ItemLockMode, world } from "@minecraft/server"
import { Config } from "../settings/config";

const CONTAINER_LOCATION = Config.uncommon_items.CONTAINER_LOCATION;

const ITEM_LIST = Config.uncommon_items.ITEM_LIST;

export class UnCommonItems {
    private static container: Container | undefined;
    static getItem(type: keyof typeof ITEM_LIST) {
        if (this.container === undefined) {
            const chest = world.getDimension('overworld').getBlock(CONTAINER_LOCATION);
            if (chest === undefined || chest.getComponent('inventory') === undefined) {
                throw Error('Cannot found UnCommonItems container.');
            } 
            this.container = chest.getComponent('inventory')!.container!;
        }

        const item = this.container.getItem(ITEM_LIST[type])?.clone();
        if (item === undefined) {
            throw Error(`${type} item is undefined`);
        }
        item.lockMode = ItemLockMode.slot;
        return item;
    }
}