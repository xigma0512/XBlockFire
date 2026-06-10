import { ItemLockMode, Player } from '@minecraft/server';

import { ShopCatalogLookup } from '../../ui/form/shop/ShopCatalog';
import { ArmorShopProduct, ArmorTier, ItemShopProduct, ShopProduct } from '../../ui/form/shop/ShopTypes';
import { HotbarManager } from '../../ui/hotbar/Hotbar';
import { ItemStackFactory } from '../../utils/ItemStackFactory';

interface PlayerLoadout {
    primary?: string;
    secondary: string;
    armorTier: ArmorTier;
    throwables: Map<string, number>;
}

export class LoadoutError extends Error {}

export class LoadoutManager {
    private static readonly loadouts = new Map<Player, PlayerLoadout>();

    static initialize(player: Player) {
        this.loadouts.set(player, {
            secondary: 'glock17',
            armorTier: 'none',
            throwables: new Map(),
        });
    }

    static initializePlayer(player: Player) {
        this.initialize(player);
    }

    static remove(player: Player) {
        this.loadouts.delete(player);
    }

    static removePlayer(player: Player) {
        this.remove(player);
    }

    static getLoadout(player: Player) {
        if (!this.loadouts.has(player)) this.initialize(player);
        return this.loadouts.get(player)!;
    }

    static getArmorReduction(player: Player) {
        const armorTier = this.getLoadout(player).armorTier;
        if (armorTier === 'light') return 0.3;
        if (armorTier === 'heavy') return 0.45;
        return 0;
    }

    static applyArmorReduction(player: Player, damage: number) {
        return Math.ceil(damage * (1 - this.getArmorReduction(player)));
    }

    static getThrowableAmount(player: Player, productId: string) {
        return this.getLoadout(player).throwables.get(productId) ?? 0;
    }

    static getThrowableTotal(player: Player) {
        let total = 0;
        for (const amount of this.getLoadout(player).throwables.values()) total += amount;
        return total;
    }

    static isProductSelected(player: Player, product: ShopProduct) {
        const loadout = this.getLoadout(player);

        if (product.category === 'primary') return loadout.primary === product.productId;
        if (product.category === 'secondary') return loadout.secondary === product.productId;
        if (product.category === 'throwable') return this.getThrowableAmount(player, product.productId) > 0;
        return loadout.armorTier === (product as ArmorShopProduct).armorTier;
    }

    static clearPrimary(player: Player) {
        this.getLoadout(player).primary = undefined;
        this.applyHotbar(player);
    }

    static removeThrowable(player: Player, productId: string) {
        const loadout = this.getLoadout(player);
        const currentAmount = loadout.throwables.get(productId) ?? 0;

        if (currentAmount <= 1) loadout.throwables.delete(productId);
        else loadout.throwables.set(productId, currentAmount - 1);

        this.applyHotbar(player);
    }

    static clearThrowables(player: Player) {
        this.getLoadout(player).throwables.clear();
        this.applyHotbar(player);
    }

    static describeLoadout(player: Player) {
        const loadout = this.getLoadout(player);
        const primary = loadout.primary ? ShopCatalogLookup.getProduct(loadout.primary)?.name : '無';
        const secondary = ShopCatalogLookup.getProduct(loadout.secondary)?.name ?? 'Glock17';
        const armor = ShopCatalogLookup.getArmorProduct(loadout.armorTier)?.name ?? '無護甲';
        const throwables =
            [...loadout.throwables.entries()]
                .map(
                    ([productId, amount]) => `${ShopCatalogLookup.getProduct(productId)?.name ?? productId} x${amount}`
                )
                .join(', ') || 'None';

        return { primary, secondary, armor, throwables };
    }

    private static applyHotbar(player: Player) {
        const loadout = this.getLoadout(player);
        const hotbar = HotbarManager.getPlayerHotbar(player);

        hotbar.items[0] = loadout.primary
            ? this.createProductItem(this.requireItemProduct(loadout.primary, 'primary'))
            : undefined;
        hotbar.items[1] = this.createProductItem(this.requireItemProduct(loadout.secondary, 'secondary'));

        for (const product of ShopCatalogLookup.getProductsByCategory('throwable')) {
            hotbar.items[(product as ItemShopProduct).slot] = undefined;
        }

        for (const [productId, amount] of loadout.throwables) {
            const product = this.requireItemProduct(productId, 'throwable');
            const item = this.createProductItem(product);
            item.amount = amount;
            hotbar.items[product.slot] = item;
        }

        HotbarManager.sendHotbar(player, hotbar);
    }

    private static createProductItem(product: ItemShopProduct) {
        if (product.itemActor) {
            const item = new product.itemActor().item;
            if (item.lockMode === ItemLockMode.none) item.lockMode = ItemLockMode.slot;
            return item;
        }

        return ItemStackFactory.new({
            typeId: product.itemStackTypeId!,
            lockMode: ItemLockMode.slot,
        });
    }

    static requireItemProduct(productId: string, category: ItemShopProduct['category']) {
        const product = ShopCatalogLookup.getProduct(productId);
        if (!product || product.category !== category) throw new LoadoutError('shop.error.product_not_found');
        return product as ItemShopProduct;
    }

    static setPrimaryFree(player: Player, productId: string) {
        const product = this.requireItemProduct(productId, 'primary');
        this.getLoadout(player).primary = product.productId;
        this.applyHotbar(player);
    }

    static setSecondaryFree(player: Player, productId: string) {
        const product = this.requireItemProduct(productId, 'secondary');
        this.getLoadout(player).secondary = product.productId;
        this.applyHotbar(player);
    }

    static setArmorFree(player: Player, armorTier: ArmorTier) {
        const armorProduct = ShopCatalogLookup.getArmorProduct(armorTier);
        if (!armorProduct) throw new LoadoutError('shop.error.product_not_found');
        this.getLoadout(player).armorTier = armorProduct.armorTier;
    }

    static applyCurrentHotbar(player: Player) {
        this.applyHotbar(player);
    }
}
