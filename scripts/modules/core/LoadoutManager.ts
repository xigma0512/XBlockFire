import { ItemLockMode, Player } from "@minecraft/server";

import { HotbarManager } from "../../ui/hotbar/Hotbar";
import {
    ArmorTier,
    ItemShopProduct,
    ShopCatalogLookup,
    THROWABLE_TOTAL_LIMIT
} from "../../ui/form/shop/ShopCatalog";
import { ItemStackFactory } from "../../utils/ItemStackFactory";

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
            secondary: "glock17",
            armorTier: "none",
            throwables: new Map()
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

    static getUsedPoints(player: Player) {
        const loadout = this.getLoadout(player);
        let usedPoints = 0;
        const productIds = [loadout.primary, loadout.secondary].filter((productId): productId is string => productId !== undefined);

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

    static getAvailablePoints(player: Player, pointLimit: number) {
        return pointLimit - this.getUsedPoints(player);
    }

    static setPrimary(player: Player, productId: string, pointLimit: number) {
        const product = this.requireItemProduct(productId, "primary");
        const loadout = this.getLoadout(player);
        const previous = loadout.primary;
        loadout.primary = product.productId;
        this.assertWithinPoints(player, pointLimit, () => loadout.primary = previous);
        this.applyHotbar(player);
    }

    static setSecondary(player: Player, productId: string, pointLimit: number) {
        const product = this.requireItemProduct(productId, "secondary");
        const loadout = this.getLoadout(player);
        const previous = loadout.secondary;
        loadout.secondary = product.productId;
        this.assertWithinPoints(player, pointLimit, () => loadout.secondary = previous);
        this.applyHotbar(player);
    }

    static setArmor(player: Player, armorTier: ArmorTier, pointLimit: number) {
        const armorProduct = ShopCatalogLookup.getArmorProduct(armorTier);
        if (!armorProduct) throw new LoadoutError("shop.error.product_not_found");

        const loadout = this.getLoadout(player);
        const previous = loadout.armorTier;
        loadout.armorTier = armorProduct.armorTier;
        this.assertWithinPoints(player, pointLimit, () => loadout.armorTier = previous);
    }

    static addThrowable(player: Player, productId: string, pointLimit: number) {
        const product = this.requireItemProduct(productId, "throwable");
        const loadout = this.getLoadout(player);
        const currentAmount = loadout.throwables.get(product.productId) ?? 0;
        const totalAmount = this.getThrowableTotal(player);

        if (currentAmount >= product.maxAmount) throw new LoadoutError("shop.error.item_limit_reached");
        if (totalAmount >= THROWABLE_TOTAL_LIMIT) throw new LoadoutError("shop.error.throwable_total_limit_reached");

        loadout.throwables.set(product.productId, currentAmount + 1);
        this.assertWithinPoints(player, pointLimit, () => {
            if (currentAmount === 0) loadout.throwables.delete(product.productId);
            else loadout.throwables.set(product.productId, currentAmount);
        });
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

    static sanitizeForCurrentRound(player: Player, pointLimit: number) {
        const loadout = this.getLoadout(player);
        if (this.getUsedPoints(player) <= pointLimit) {
            this.applyHotbar(player);
            return false;
        }

        loadout.primary = undefined;
        loadout.throwables.clear();
        loadout.armorTier = "none";

        const secondary = ShopCatalogLookup.getProduct(loadout.secondary);
        if (!secondary || secondary.pointCost > pointLimit) loadout.secondary = "glock17";

        this.applyHotbar(player);
        return true;
    }

    static getArmorReduction(player: Player) {
        const armorTier = this.getLoadout(player).armorTier;
        if (armorTier === "light") return 0.15;
        if (armorTier === "heavy") return 0.30;
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

    static describeLoadout(player: Player) {
        const loadout = this.getLoadout(player);
        const primary = loadout.primary ? ShopCatalogLookup.getProduct(loadout.primary)?.name : "None";
        const secondary = ShopCatalogLookup.getProduct(loadout.secondary)?.name ?? "Glock17";
        const armor = ShopCatalogLookup.getArmorProduct(loadout.armorTier)?.name ?? "No Armor";
        const throwables = [...loadout.throwables.entries()]
            .map(([productId, amount]) => `${ShopCatalogLookup.getProduct(productId)?.name ?? productId} x${amount}`)
            .join(", ") || "None";

        return { primary, secondary, armor, throwables };
    }

    private static applyHotbar(player: Player) {
        const loadout = this.getLoadout(player);
        const hotbar = HotbarManager.getPlayerHotbar(player);

        hotbar.items[0] = loadout.primary ? this.createProductItem(this.requireItemProduct(loadout.primary, "primary")) : undefined;
        hotbar.items[1] = this.createProductItem(this.requireItemProduct(loadout.secondary, "secondary"));

        for (const product of ShopCatalogLookup.getProductsByCategory("throwable")) {
            hotbar.items[(product as ItemShopProduct).slot] = undefined;
        }

        for (const [productId, amount] of loadout.throwables) {
            const product = this.requireItemProduct(productId, "throwable");
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
            lockMode: ItemLockMode.slot
        });
    }

    private static requireItemProduct(productId: string, category: ItemShopProduct["category"]) {
        const product = ShopCatalogLookup.getProduct(productId);
        if (!product || product.category !== category) throw new LoadoutError("shop.error.product_not_found");
        return product as ItemShopProduct;
    }

    private static assertWithinPoints(player: Player, pointLimit: number, rollback: () => void) {
        if (this.getUsedPoints(player) <= pointLimit) return;
        rollback();
        throw new LoadoutError("shop.error.no_points");
    }
}
