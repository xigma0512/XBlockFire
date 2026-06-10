export interface DeathmatchThrowableRestockProduct {
    productId: string;
    slot: number;
    itemStackTypeId?: string;
}

export interface DeathmatchThrowableHotbarItem {
    typeId: string;
    amount?: number;
}

export function getDeathmatchThrowableRestocks<T extends DeathmatchThrowableRestockProduct>(
    products: readonly T[],
    hotbarItems: readonly (DeathmatchThrowableHotbarItem | undefined)[],
    maxAmount = 1
) {
    return products.filter((product) => {
        if (!product.itemStackTypeId) return false;

        const item = hotbarItems[product.slot];
        return item?.typeId !== product.itemStackTypeId || (item.amount ?? 1) !== maxAmount;
    });
}
