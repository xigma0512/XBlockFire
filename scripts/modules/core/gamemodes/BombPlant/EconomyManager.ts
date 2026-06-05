import { Player } from '@minecraft/server';
import { ShopCatalogLookup, THROWABLE_TOTAL_LIMIT } from '../../../../ui/form/shop/ShopCatalog';
import { ArmorShopProduct, ArmorTier, ItemShopProduct, ShopProduct } from '../../../../ui/form/shop/ShopTypes';
import { LoadoutManager, LoadoutError } from '../../LoadoutManager';

export class EconomyManager {
    static getUsedPoints(player: Player) {
        const loadout = LoadoutManager.getLoadout(player);
        let usedPoints = 0;
        const productIds = [loadout.primary, loadout.secondary].filter(
            (productId): productId is string => productId !== undefined
        );

        for (const productId of productIds) {
            const product = ShopCatalogLookup.getProduct(productId);
            if (product) usedPoints += product.pointCost;
        }

        const armorProduct = ShopCatalogLookup.getArmorProduct(loadout.armorTier);
        if (armorProduct) usedPoints += armorProduct.pointCost;

        for (const [productId, amount] of loadout.throwables) {
            const product = ShopCatalogLookup.getProduct(productId);
            if (product) usedPoints += product.pointCost * amount;
        }

        return usedPoints;
    }

    static canAffordProduct(player: Player, product: ShopProduct, pointLimit: number) {
        return this.getUsedPoints(player) + this.getAdditionalPointCost(player, product) <= pointLimit;
    }

    static setPrimary(player: Player, productId: string, pointLimit: number) {
        const loadout = LoadoutManager.getLoadout(player);
        const previous = loadout.primary;

        LoadoutManager.setPrimaryFree(player, productId);
        this.assertWithinPoints(player, pointLimit, () => {
            if (previous) LoadoutManager.setPrimaryFree(player, previous);
            else LoadoutManager.clearPrimary(player);
        });
    }

    static setSecondary(player: Player, productId: string, pointLimit: number) {
        const loadout = LoadoutManager.getLoadout(player);
        const previous = loadout.secondary;

        LoadoutManager.setSecondaryFree(player, productId);
        this.assertWithinPoints(player, pointLimit, () => {
            LoadoutManager.setSecondaryFree(player, previous);
        });
    }

    static setArmor(player: Player, armorTier: ArmorTier, pointLimit: number) {
        const loadout = LoadoutManager.getLoadout(player);
        const previous = loadout.armorTier;

        LoadoutManager.setArmorFree(player, armorTier);
        this.assertWithinPoints(player, pointLimit, () => {
            LoadoutManager.setArmorFree(player, previous);
        });
    }

    static addThrowable(player: Player, productId: string, pointLimit: number) {
        const product = LoadoutManager.requireItemProduct(productId, 'throwable');
        const loadout = LoadoutManager.getLoadout(player);
        const currentAmount = loadout.throwables.get(product.productId) ?? 0;
        const totalAmount = LoadoutManager.getThrowableTotal(player);

        if (currentAmount >= product.maxAmount) throw new LoadoutError('shop.error.item_limit_reached');
        if (totalAmount >= THROWABLE_TOTAL_LIMIT) throw new LoadoutError('shop.error.throwable_total_limit_reached');

        loadout.throwables.set(product.productId, currentAmount + 1);
        this.assertWithinPoints(player, pointLimit, () => {
            if (currentAmount === 0) loadout.throwables.delete(product.productId);
            else loadout.throwables.set(product.productId, currentAmount);
        });
        LoadoutManager.applyCurrentHotbar(player);
    }

    static sanitizeForCurrentRound(player: Player, pointLimit: number) {
        const loadout = LoadoutManager.getLoadout(player);
        if (this.getUsedPoints(player) <= pointLimit) {
            LoadoutManager.applyCurrentHotbar(player);
            return false;
        }

        LoadoutManager.clearPrimary(player);
        LoadoutManager.clearThrowables(player);
        LoadoutManager.setArmorFree(player, 'none');

        const secondary = ShopCatalogLookup.getProduct(loadout.secondary);
        if (!secondary || secondary.pointCost > pointLimit) {
            LoadoutManager.setSecondaryFree(player, 'glock17');
        }

        LoadoutManager.applyCurrentHotbar(player);
        return true;
    }

    private static getAdditionalPointCost(player: Player, product: ShopProduct) {
        if (product.category === 'throwable') return product.pointCost;

        const selectedProduct = this.getSelectedProductInCategory(player, product);
        return product.pointCost - (selectedProduct?.pointCost ?? 0);
    }

    private static getSelectedProductInCategory(player: Player, product: ShopProduct) {
        const loadout = LoadoutManager.getLoadout(player);

        if (product.category === 'primary') {
            return loadout.primary ? ShopCatalogLookup.getProduct(loadout.primary) : undefined;
        }

        if (product.category === 'secondary') {
            return ShopCatalogLookup.getProduct(loadout.secondary);
        }

        if (product.category === 'armor') {
            return ShopCatalogLookup.getArmorProduct(loadout.armorTier);
        }

        return undefined;
    }

    private static assertWithinPoints(player: Player, pointLimit: number, rollback: () => void) {
        if (this.getUsedPoints(player) <= pointLimit) return;
        rollback();
        throw new LoadoutError('shop.error.no_points');
    }
}
