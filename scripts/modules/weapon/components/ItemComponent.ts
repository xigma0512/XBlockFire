import { Component } from "./Component";

import { ItemLockMode } from "@minecraft/server";

type ComponentDataType = Partial<{
    nametag: string;
    lore: string[];

    keepOnDeath: boolean;
    lockMode: ItemLockMode;
    canDestroy: string[];
    canPlaceOn: string[];
}>

export class ItemComponent extends Component {

    readonly nametag?: string;
    readonly lore?: string[];

    readonly keepOnDeath: boolean;
    readonly lockMode: ItemLockMode;
    readonly canDestroy?: string[];
    readonly canPlaceOn?: string[];

    constructor(data: ComponentDataType) {
        super('item');

        this.nametag = data.nametag;
        this.lore = data.lore;
        this.keepOnDeath = data.keepOnDeath ?? false;
        this.lockMode = data.lockMode ?? ItemLockMode.none;
        this.canDestroy = data.canDestroy;
        this.canPlaceOn = data.canPlaceOn;
    }
}