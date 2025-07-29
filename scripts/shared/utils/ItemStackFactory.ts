import { ItemLockMode, ItemStack } from "@minecraft/server";

interface ItemStackInfo {
    typeId: string;
    amount?: number;

    nametag?: string;
    lore?: string[];

    keepOnDeath?: boolean;
    lockMode?: ItemLockMode;
    canDestroy?: string[];
    canPlaceOn?: string[];
}

export class ItemStackFactory {
    static new(itemInfo: ItemStackInfo) {
        const item = new ItemStack(itemInfo.typeId, itemInfo.amount ?? 1);
        
        item.nameTag = itemInfo.nametag;
        item.setLore(itemInfo.lore);
        item.keepOnDeath = itemInfo.keepOnDeath ?? false;
        item.lockMode = itemInfo.lockMode ?? ItemLockMode.none;
        item.setCanDestroy(itemInfo.canDestroy);
        item.setCanPlaceOn(itemInfo.canPlaceOn);

        return item;
    }
}