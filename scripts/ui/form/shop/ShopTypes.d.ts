import { ItemActor } from '../../../modules/combat/weapon/actors/Actor';

export type ShopCategoryId = 'primary' | 'secondary' | 'throwable' | 'armor';
export type ArmorTier = 'none' | 'light' | 'heavy';

export interface BaseShopProduct {
    productId: string;
    category: ShopCategoryId;
    name: string;
    pointCost: number;
    iconPath?: string;
}

export interface ItemShopProduct extends BaseShopProduct {
    category: 'primary' | 'secondary' | 'throwable';
    slot: number;
    maxAmount: number;
    itemActor?: new () => ItemActor;
    itemStackTypeId?: string;
}

export interface ArmorShopProduct extends BaseShopProduct {
    category: 'armor';
    armorTier: ArmorTier;
}

export type ShopProduct = ItemShopProduct | ArmorShopProduct;
