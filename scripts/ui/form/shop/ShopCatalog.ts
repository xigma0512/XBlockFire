import { ArmorShopProduct, ArmorTier, ShopCategoryId, ShopProduct } from './ShopTypes';

import { AK47 } from '../../../modules/combat/weapon/actors/item/AK47';
import { AWP } from '../../../modules/combat/weapon/actors/item/AWP';
import { Deagle } from '../../../modules/combat/weapon/actors/item/Deagle';
import { Glock17 } from '../../../modules/combat/weapon/actors/item/Glock17';
import { M4A4 } from '../../../modules/combat/weapon/actors/item/M4A4';
import { P90 } from '../../../modules/combat/weapon/actors/item/P90';
import { SG200 } from '../../../modules/combat/weapon/actors/item/SG200';

export const THROWABLE_TOTAL_LIMIT = 4;

export const ShopCategories: Record<ShopCategoryId, string> = {
    secondary: '副武器',
    primary: '主武器',
    throwable: '投擲物',
    armor: '護甲',
};

export const ShopCatalog: readonly ShopProduct[] = [
    {
        productId: 'glock17',
        category: 'secondary',
        name: `Glock17`,
        pointCost: 0,
        slot: 1,
        maxAmount: 1,
        itemActor: Glock17,
        iconPath: 'textures/items/gun/glock17',
    },
    {
        productId: 'deagle',
        category: 'secondary',
        name: `Deagle`,
        pointCost: 4,
        slot: 1,
        maxAmount: 1,
        itemActor: Deagle,
        iconPath: 'textures/items/gun/deagle',
    },
    {
        productId: 'ak47',
        category: 'primary',
        name: `AK47`,
        pointCost: 8,
        slot: 0,
        maxAmount: 1,
        itemActor: AK47,
        iconPath: 'textures/items/gun/ak47',
    },
    {
        productId: 'm4a4',
        category: 'primary',
        name: `M4A4`,
        pointCost: 8,
        slot: 0,
        maxAmount: 1,
        itemActor: M4A4,
        iconPath: 'textures/items/gun/m4a4',
    },
    {
        productId: 'sg200',
        category: 'primary',
        name: `SG200`,
        pointCost: 6,
        slot: 0,
        maxAmount: 1,
        itemActor: SG200,
        iconPath: 'textures/items/gun/sg200',
    },
    {
        productId: 'p90',
        category: 'primary',
        name: `P90`,
        pointCost: 5,
        slot: 0,
        maxAmount: 1,
        itemActor: P90,
        iconPath: 'textures/items/gun/p90',
    },
    {
        productId: 'awp',
        category: 'primary',
        name: `AWP`,
        pointCost: 12,
        slot: 0,
        maxAmount: 1,
        itemActor: AWP,
        iconPath: 'textures/items/gun/awp',
    },
    {
        productId: 'smoke_grenade',
        category: 'throwable',
        name: `煙霧彈`,
        pointCost: 2,
        slot: 4,
        maxAmount: 1,
        itemStackTypeId: 'xblockfire:smoke_grenade_item',
        iconPath: 'textures/items/grenade/smoke_grenade_item',
    },
    {
        productId: 'flashbang',
        category: 'throwable',
        name: `閃光彈`,
        pointCost: 1,
        slot: 5,
        maxAmount: 2,
        itemStackTypeId: 'xblockfire:flashbang_item',
        iconPath: 'textures/items/grenade/flashbang_item',
    },
    {
        productId: 'fragmentation',
        category: 'throwable',
        name: `破片手雷`,
        pointCost: 2,
        slot: 6,
        maxAmount: 1,
        itemStackTypeId: 'xblockfire:fragmentation_item',
        iconPath: 'textures/items/grenade/flashbang_item',
    },
    {
        productId: 'incendiary_grenade',
        category: 'throwable',
        name: `燃燒手雷`,
        pointCost: 3,
        slot: 7,
        maxAmount: 1,
        itemStackTypeId: 'xblockfire:incendiary_grenade_item',
        iconPath: 'textures/items/grenade/flashbang_item',
    },
    {
        productId: 'armor_none',
        category: 'armor',
        name: `無護甲`,
        pointCost: 0,
        armorTier: 'none',
        iconPath: 'textures/blocks/barrier',
    },
    {
        productId: 'armor_light',
        category: 'armor',
        name: `輕型護甲(30)`,
        pointCost: 4,
        armorTier: 'light',
        iconPath: 'textures/items/iron_chestplate',
    },
    {
        productId: 'armor_heavy',
        category: 'armor',
        name: `重型護甲(45)`,
        pointCost: 8,
        armorTier: 'heavy',
        iconPath: 'textures/items/diamond_chestplate',
    },
];

export const ShopCatalogLookup = {
    getProduct(productId: string) {
        return ShopCatalog.find((product) => product.productId === productId);
    },

    getProductsByCategory(category: ShopCategoryId) {
        return ShopCatalog.filter((product) => product.category === category);
    },

    getArmorProduct(armorTier: ArmorTier) {
        return ShopCatalog.find(
            (product): product is ArmorShopProduct => product.category === 'armor' && product.armorTier === armorTier
        );
    },
};
