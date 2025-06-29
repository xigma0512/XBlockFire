import { ItemLockMode, ItemStack, Player } from "@minecraft/server";

export class Hotbar {
    
    private readonly items: Array<ItemStack | undefined>;

    constructor() {
        this.items = new Array<ItemStack | undefined>(9);
    }

    clearAll() {
        this.items.fill(undefined);
    }

    get(index: number) {
        if (index < 0 || index > 8) throw Error('index out of bounds');
        return this.items[index];
    }

    set(index: number, item: ItemStack | undefined) {
        if (item) {
            item.lockMode = ItemLockMode.slot;
        }
        this.items[index] = item;
        return this;
    }

    at(index: number) {
        return this.items.at(index);
    }
}

export class HotbarManager {

    private static _instance: HotbarManager;
    static get instance() { return (this._instance || (this._instance = new this())); }
    
    private players = new Map<Player, Hotbar>();

    private constructor() { 
        this.players = new Map();
    }

    getHotbar(target: Player) {
        if (!this.players.has(target)) this.players.set(target, new Hotbar());
        return this.players.get(target)!;
    }

    updateHotbar(target: Player) {
        const container = target.getComponent('inventory')!.container;
        const hotbar = this.getHotbar(target);
        for (let index = 0; index < 10; index ++) {
            hotbar.set(index, container.getItem(index));
        }
    }

    sendHotbar(target: Player) {
        const container = target.getComponent('inventory')!.container;
        const hotbar = this.getHotbar(target);
        for (let index = 0; index < 10; index ++) {
            container.setItem(index, hotbar.at(index));
        }
    }
}