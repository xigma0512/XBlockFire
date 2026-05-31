import { PhaseManager } from "../../../modules/core/gamephase/PhaseManager";
import { MemberManager } from "../../../modules/player/MemberManager";
import { EquipmentPointManager } from "../../../modules/core/EquipmentPointManager";
import { LoadoutError, LoadoutManager } from "../../../modules/core/LoadoutManager";

import { PhaseEnum as BombPlantPhaseEnum } from "../../../modules/core/gamephase/BombPlantPhaseEnum";

import { FormatCode as FC } from "../../../utils/FormatCode";
import { Language as L } from "../../../utils/Language";
import { variable } from "../../../utils/Variable";

import { Player, system, world } from "@minecraft/server";

import { TabbedActionForm } from "../common/TabbedActionForm";
import {
    ArmorShopProduct,
    ItemShopProduct,
    ShopCatalogLookup,
    ShopCategories,
    ShopCategoryId,
    ShopProduct,
    THROWABLE_TOTAL_LIMIT
} from "./ShopCatalog";

type ShopAction = "select_product" | "remove_throwable" | "clear_throwables";

export class Shop {
    static async openShop(player: Player, tabId: ShopCategoryId = "primary") {
        const pointLimit = getCurrentPointLimit();
        const form = new TabbedActionForm<ShopAction>()
            .title(L.translate("shop.title"))
            .body(buildBody(player, pointLimit));

        for (const [category, label] of Object.entries(ShopCategories) as [ShopCategoryId, string][]) {
            form.tab(category, label);
        }

        for (const category of Object.keys(ShopCategories) as ShopCategoryId[]) {
            for (const product of ShopCatalogLookup.getProductsByCategory(category)) {
                addProductButton(form, player, product, pointLimit);
            }
        }
        addThrowableControls(form, player);

        const response = await form.show(player, tabId);
        if (response.canceled || !response.action) return;

        try {
            handleAction(player, response.action, response.value, pointLimit);
            player.playSound("mob.villager.yes");
        } catch (err: any) {
            const key = err instanceof LoadoutError ? err.message : "shop.error.product_not_found";
            player.sendMessage(L.translate("shop.error.prefix", L.translate(key as any)));
            player.playSound("mob.villager.no");
        }

        system.run(() => this.openShop(player, response.tabId as ShopCategoryId));
    }
}

function getCurrentPointLimit() {
    return EquipmentPointManager.getPointLimit(variable("attacker_score"), variable("defender_score"));
}

function buildBody(player: Player, pointLimit: number) {
    const loadout = LoadoutManager.describeLoadout(player);
    return L.translate(
        "shop.body",
        LoadoutManager.getUsedPoints(player),
        pointLimit,
        loadout.primary ?? "None",
        loadout.secondary,
        loadout.armor,
        loadout.throwables
    );
}

function addProductButton(
    form: TabbedActionForm<ShopAction>,
    player: Player,
    product: ShopProduct,
    pointLimit: number
) {
    const suffix = product.category === "throwable"
        ? ` x${LoadoutManager.getThrowableAmount(player, product.productId)}/${(product as ItemShopProduct).maxAmount}`
        : "";
    const remaining = LoadoutManager.getAvailablePoints(player, pointLimit);
    const label = `${product.name}${suffix} ${FC.Yellow}${product.pointCost}P\n${FC.DarkGray}${L.translate("shop.remaining_points", remaining)}`;

    form.button(product.category, {
        text: label,
        iconPath: product.iconPath,
        action: "select_product",
        value: product.productId
    });
}

function addThrowableControls(form: TabbedActionForm<ShopAction>, player: Player) {
    const throwableProducts = ShopCatalogLookup.getProductsByCategory("throwable") as ItemShopProduct[];
    for (const product of throwableProducts) {
        if (LoadoutManager.getThrowableAmount(player, product.productId) <= 0) continue;
        form.button("throwable", {
            text: L.translate("shop.throwable.remove", product.name),
            action: "remove_throwable",
            value: product.productId
        });
    }

    if (LoadoutManager.getThrowableTotal(player) > 0) {
        form.button("throwable", {
            text: L.translate("shop.throwable.clear", LoadoutManager.getThrowableTotal(player), THROWABLE_TOTAL_LIMIT),
            action: "clear_throwables"
        });
    }
}

function handleAction(player: Player, action: ShopAction, value: string | undefined, pointLimit: number) {
    if (action === "clear_throwables") {
        LoadoutManager.clearThrowables(player);
        return;
    }

    if (!value) throw new LoadoutError("shop.error.product_not_found");

    if (action === "remove_throwable") {
        LoadoutManager.removeThrowable(player, value);
        return;
    }

    const product = ShopCatalogLookup.getProduct(value);
    if (!product) throw new LoadoutError("shop.error.product_not_found");

    if (product.category === "primary") LoadoutManager.setPrimary(player, product.productId, pointLimit);
    else if (product.category === "secondary") LoadoutManager.setSecondary(player, product.productId, pointLimit);
    else if (product.category === "throwable") LoadoutManager.addThrowable(player, product.productId, pointLimit);
    else LoadoutManager.setArmor(player, (product as ArmorShopProduct).armorTier, pointLimit);
}

world.beforeEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId !== "minecraft:feather") return;

    const player = ev.source;
    if (!MemberManager.includePlayer(player)) return;

    const phase = PhaseManager.getPhase();
    if (phase.phaseTag !== BombPlantPhaseEnum.Buying) {
        system.run(() => player.sendMessage(L.translate("shop.error.prefix", L.translate("shop.error.not_buying"))));
        return;
    }

    system.run(() => {
        Shop.openShop(player);
    });
});
