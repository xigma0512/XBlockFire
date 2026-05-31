# Economy Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the BombPlant money economy with a fair round-based equipment point system and a multi-tab instant-apply shop.

**Architecture:** Add focused core modules for point limits and player loadouts, move shop product data into a point-based catalog, wrap Bedrock `ActionFormData` with a reusable tabbed form helper, and keep `Shop.ts` as a thin UI controller. Existing round phases continue to own timing and team visual armor, while `LoadoutManager` owns gameplay equipment and hidden armor reduction.

**Tech Stack:** TypeScript, Minecraft Bedrock `@minecraft/server`, `@minecraft/server-ui`, existing `just-scripts` build and lint pipeline.

---

## File Map

- Create `scripts/modules/core/EquipmentPointManager.ts`: round point curve.
- Create `scripts/modules/core/LoadoutManager.ts`: player loadout state, point validation, hotbar application, hidden armor reduction.
- Create `scripts/ui/form/shop/ShopCatalog.ts`: point-based shop categories and products.
- Create `scripts/ui/form/common/TabbedActionForm.ts`: reusable tabbed `ActionFormData` wrapper.
- Modify `scripts/ui/form/shop/Shop.ts`: render tabbed shop and dispatch actions to `LoadoutManager`.
- Modify `scripts/modules/combat/weapon/systems/bullet/BulletDamage.ts`: apply hidden armor reduction.
- Modify `scripts/modules/core/gamephase/bomb_plant/Idle.ts`: initialize loadouts.
- Modify `scripts/modules/core/gamephase/bomb_plant/PreRoundStart.ts`: sanitize and apply loadouts after round reset.
- Modify `scripts/modules/core/gamephase/bomb_plant/Buying.ts`: remove `PurchaseHistory` usage.
- Modify `scripts/modules/core/gamephase/bomb_plant/RoundEnd.ts`: remove income and side-switch money reset.
- Modify `scripts/modules/player/PlayerDeathHandler.ts`: remove kill money reward.
- Modify `scripts/modules/core/c4state/states/Planted.ts`: remove bomb plant money reward.
- Modify `scripts/settings/lang/zh_TW.ts`: replace shop money text with point and loadout text.
- Verify `scripts/settings/lang/LanguageKey.d.ts`: language keys derive from `zh_TW`.
- Remove `scripts/modules/core/EconomyManager.ts` only after all imports are gone.
- Remove `scripts/ui/form/shop/ProductTable.ts` only after all imports are gone.

Validation commands:

- `npm run build`
- `npm run lint`

---

## Task 1: Add Round Point Manager

**Files:**
- Create: `scripts/modules/core/EquipmentPointManager.ts`

- [ ] **Step 1: Create the point manager**

Create `scripts/modules/core/EquipmentPointManager.ts`:

```typescript
const POINT_LIMITS = [2, 3, 4, 5, 5, 6, 6, 8] as const;

export class EquipmentPointManager {
    static getPointLimitForRound(round: number) {
        const safeRound = Math.max(1, Math.floor(round));
        return POINT_LIMITS[Math.min(safeRound, POINT_LIMITS.length) - 1];
    }

    static getPointLimit(attackerScore: number, defenderScore: number) {
        return this.getPointLimitForRound(attackerScore + defenderScore + 1);
    }
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS. If the build reports no imports use this module yet, that is fine; TypeScript still compiles it through `scripts/**/*`.

- [ ] **Step 3: Commit**

```bash
git add scripts/modules/core/EquipmentPointManager.ts
git commit -m "feat: add equipment point curve"
```

---

## Task 2: Add Point-Based Shop Catalog

**Files:**
- Create: `scripts/ui/form/shop/ShopCatalog.ts`

- [ ] **Step 1: Create catalog types and data**

Create `scripts/ui/form/shop/ShopCatalog.ts`:

```typescript
import { ItemActor } from "../../../modules/combat/weapon/actors/Actor";

import { AK47 } from "../../../modules/combat/weapon/actors/item/AK47";
import { M4A4 } from "../../../modules/combat/weapon/actors/item/M4A4";
import { SG200 } from "../../../modules/combat/weapon/actors/item/SG200";
import { AWP } from "../../../modules/combat/weapon/actors/item/AWP";
import { P90 } from "../../../modules/combat/weapon/actors/item/P90";
import { Glock17 } from "../../../modules/combat/weapon/actors/item/Glock17";
import { Deagle } from "../../../modules/combat/weapon/actors/item/Deagle";

export type ShopCategoryId = "primary" | "secondary" | "throwable" | "armor";
export type ArmorTier = "none" | "light" | "heavy";

interface BaseShopProduct {
    readonly id: string;
    readonly category: ShopCategoryId;
    readonly pointCost: number;
    readonly name: string;
    readonly description?: string;
    readonly iconPath?: string;
}

export interface ItemShopProduct extends BaseShopProduct {
    readonly category: "primary" | "secondary" | "throwable";
    readonly slot: number;
    readonly maxAmount: number;
    readonly itemActor?: new () => ItemActor;
    readonly itemStackTypeId?: string;
}

export interface ArmorShopProduct extends BaseShopProduct {
    readonly category: "armor";
    readonly armorTier: ArmorTier;
}

export type ShopProduct = ItemShopProduct | ArmorShopProduct;

export const THROWABLE_TOTAL_LIMIT = 4;

export const ShopCategories: ReadonlyArray<{ id: ShopCategoryId; label: string }> = [
    { id: "primary", label: "主武器" },
    { id: "secondary", label: "副武器" },
    { id: "throwable", label: "投擲物" },
    { id: "armor", label: "護甲" }
];

export const ShopCatalog: ReadonlyArray<ShopProduct> = [
    { id: "ak47", category: "primary", pointCost: 4, maxAmount: 1, slot: 0, itemActor: AK47, name: "AK47", iconPath: "textures/items/gun/ak47" },
    { id: "m4a4", category: "primary", pointCost: 4, maxAmount: 1, slot: 0, itemActor: M4A4, name: "M4A4", iconPath: "textures/items/gun/m4a4" },
    { id: "sg200", category: "primary", pointCost: 3, maxAmount: 1, slot: 0, itemActor: SG200, name: "SG200", iconPath: "textures/items/gun/sg200" },
    { id: "p90", category: "primary", pointCost: 3, maxAmount: 1, slot: 0, itemActor: P90, name: "P90", iconPath: "textures/items/gun/p90" },
    { id: "awp", category: "primary", pointCost: 6, maxAmount: 1, slot: 0, itemActor: AWP, name: "AWP", iconPath: "textures/items/gun/awp" },
    { id: "glock17", category: "secondary", pointCost: 0, maxAmount: 1, slot: 1, itemActor: Glock17, name: "Glock17", iconPath: "textures/items/gun/glock17" },
    { id: "deagle", category: "secondary", pointCost: 2, maxAmount: 1, slot: 1, itemActor: Deagle, name: "Deagle", iconPath: "textures/items/gun/deagle" },
    { id: "smoke", category: "throwable", pointCost: 1, maxAmount: 1, slot: 4, itemStackTypeId: "xblockfire:smoke_grenade_item", name: "SmokeGrenade", iconPath: "textures/items/grenade/smoke_grenade_item" },
    { id: "flashbang", category: "throwable", pointCost: 1, maxAmount: 2, slot: 5, itemStackTypeId: "xblockfire:flashbang_item", name: "Flashbang", iconPath: "textures/items/grenade/flashbang_item" },
    { id: "armor_none", category: "armor", pointCost: 0, armorTier: "none", name: "No Armor" },
    { id: "armor_light", category: "armor", pointCost: 2, armorTier: "light", name: "Light Armor" },
    { id: "armor_heavy", category: "armor", pointCost: 4, armorTier: "heavy", name: "Heavy Armor" }
];

export class ShopCatalogLookup {
    static getProduct(productId: string) {
        return ShopCatalog.find(product => product.id === productId);
    }

    static getProductsByCategory(category: ShopCategoryId) {
        return ShopCatalog.filter(product => product.category === category);
    }

    static getArmorProduct(armorTier: ArmorTier) {
        return ShopCatalog.find(product => product.category === "armor" && product.armorTier === armorTier) as ArmorShopProduct;
    }
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add scripts/ui/form/shop/ShopCatalog.ts
git commit -m "feat: add point shop catalog"
```

---

## Task 3: Add Loadout Manager

**Files:**
- Create: `scripts/modules/core/LoadoutManager.ts`

- [ ] **Step 1: Create loadout state and validation**

Create `scripts/modules/core/LoadoutManager.ts`:

```typescript
import { Player, ItemLockMode } from "@minecraft/server";

import { HotbarManager } from "../../ui/hotbar/Hotbar";
import { ItemStackFactory } from "../../utils/ItemStackFactory";
import {
    ArmorTier,
    ItemShopProduct,
    ShopCatalogLookup,
    ShopProduct,
    THROWABLE_TOTAL_LIMIT
} from "../../ui/form/shop/ShopCatalog";

interface PlayerLoadout {
    primary?: string;
    secondary: string;
    armorTier: ArmorTier;
    throwables: Map<string, number>;
}

export class LoadoutError extends Error {}

export class LoadoutManager {
    private static readonly loadouts = new Map<Player, PlayerLoadout>();

    static initializePlayer(player: Player) {
        this.loadouts.set(player, {
            secondary: "glock17",
            armorTier: "none",
            throwables: new Map()
        });
    }

    static removePlayer(player: Player) {
        this.loadouts.delete(player);
    }

    static getLoadout(player: Player) {
        if (!this.loadouts.has(player)) this.initializePlayer(player);
        return this.loadouts.get(player)!;
    }

    static getUsedPoints(player: Player) {
        const loadout = this.getLoadout(player);
        let usedPoints = 0;

        const productIds = [loadout.primary, loadout.secondary].filter((id): id is string => id !== undefined);
        for (const productId of productIds) {
            const product = ShopCatalogLookup.getProduct(productId);
            if (product) usedPoints += product.pointCost;
        }

        usedPoints += ShopCatalogLookup.getArmorProduct(loadout.armorTier).pointCost;

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
        loadout.primary = product.id;
        this.assertWithinPoints(player, pointLimit, () => loadout.primary = previous);
        this.applyHotbar(player);
    }

    static setSecondary(player: Player, productId: string, pointLimit: number) {
        const product = this.requireItemProduct(productId, "secondary");
        const loadout = this.getLoadout(player);
        const previous = loadout.secondary;
        loadout.secondary = product.id;
        this.assertWithinPoints(player, pointLimit, () => loadout.secondary = previous);
        this.applyHotbar(player);
    }

    static setArmor(player: Player, armorTier: ArmorTier, pointLimit: number) {
        const loadout = this.getLoadout(player);
        const previous = loadout.armorTier;
        loadout.armorTier = armorTier;
        this.assertWithinPoints(player, pointLimit, () => loadout.armorTier = previous);
    }

    static addThrowable(player: Player, productId: string, pointLimit: number) {
        const product = this.requireItemProduct(productId, "throwable");
        const loadout = this.getLoadout(player);
        const currentAmount = loadout.throwables.get(product.id) ?? 0;
        const totalAmount = this.getThrowableTotal(player);

        if (currentAmount >= product.maxAmount) throw new LoadoutError("shop.error.item_limit_reached");
        if (totalAmount >= THROWABLE_TOTAL_LIMIT) throw new LoadoutError("shop.error.throwable_total_limit_reached");

        loadout.throwables.set(product.id, currentAmount + 1);
        this.assertWithinPoints(player, pointLimit, () => {
            if (currentAmount === 0) loadout.throwables.delete(product.id);
            else loadout.throwables.set(product.id, currentAmount);
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
        const reduction = this.getArmorReduction(player);
        return Math.ceil(damage * (1 - reduction));
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
        const armor = ShopCatalogLookup.getArmorProduct(loadout.armorTier).name;
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

        for (let slot = 4; slot <= 7; slot++) hotbar.items[slot] = undefined;
        for (const [productId, amount] of loadout.throwables) {
            const product = this.requireItemProduct(productId, "throwable");
            const item = this.createProductItem(product);
            item.amount = amount;
            hotbar.items[product.slot] = item;
        }

        HotbarManager.sendHotbar(player, hotbar);
    }

    private static createProductItem(product: ItemShopProduct) {
        if (product.itemActor) return new product.itemActor().item;
        return ItemStackFactory.new({ typeId: product.itemStackTypeId!, lockMode: ItemLockMode.slot });
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
```

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add scripts/modules/core/LoadoutManager.ts
git commit -m "feat: add player loadout manager"
```

---

## Task 4: Apply Hidden Armor Damage Reduction

**Files:**
- Modify: `scripts/modules/combat/weapon/systems/bullet/BulletDamage.ts`

- [ ] **Step 1: Import `LoadoutManager`**

Add this import near the other module imports:

```typescript
import { LoadoutManager } from "../../../../core/LoadoutManager";
```

- [ ] **Step 2: Apply armor reduction before health changes**

Replace:

```typescript
const damage = damageComp[distance][hitPart];
```

with:

```typescript
const rawDamage = damageComp[distance][hitPart];
const damage = LoadoutManager.applyArmorReduction(target, rawDamage);
```

- [ ] **Step 3: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add scripts/modules/combat/weapon/systems/bullet/BulletDamage.ts
git commit -m "feat: apply loadout armor reduction"
```

---

## Task 5: Add Tabbed Action Form Wrapper

**Files:**
- Create: `scripts/ui/form/common/TabbedActionForm.ts`

- [ ] **Step 1: Create the common form wrapper**

Create `scripts/ui/form/common/TabbedActionForm.ts`:

```typescript
import { Player } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";

interface TabbedButton<TAction extends string> {
    readonly text: string;
    readonly iconPath?: string;
    readonly action: TAction;
    readonly value?: string;
}

interface Tab<TAction extends string> {
    readonly id: string;
    readonly label: string;
    readonly buttons: TabbedButton<TAction>[];
}

export interface TabbedActionFormResult<TAction extends string> {
    readonly canceled: boolean;
    readonly tabId: string;
    readonly action?: TAction;
    readonly value?: string;
}

const TITLE_MARKER = "禮c禮u禮s禮t禮o禮m禮r";
const CATEGORY_MARKER = "禮c禮a禮t禮e禮g禮o禮r禮y禮8";

export class TabbedActionForm<TAction extends string> {
    private readonly tabs: Tab<TAction>[] = [];
    private titleText = "";
    private bodyText = "";

    title(title: string) {
        this.titleText = title;
        return this;
    }

    body(body: string) {
        this.bodyText = body;
        return this;
    }

    tab(id: string, label: string) {
        if (!this.tabs.some(tab => tab.id === id)) {
            this.tabs.push({ id, label, buttons: [] });
        }
        return this;
    }

    button(tabId: string, button: TabbedButton<TAction>) {
        const tab = this.tabs.find(tab => tab.id === tabId);
        if (!tab) throw new Error(`Missing tab: ${tabId}`);
        tab.buttons.push(button);
        return this;
    }

    async show(player: Player, selectedTabId = this.tabs[0]?.id): Promise<TabbedActionFormResult<TAction>> {
        const tab = this.tabs.find(tab => tab.id === selectedTabId) ?? this.tabs[0];
        const form = new ActionFormData();

        form.title(`${TITLE_MARKER}${this.titleText}`);
        for (const button of tab.buttons) {
            form.button(button.text, button.iconPath);
        }
        for (const candidate of this.tabs) {
            form.button(`${CATEGORY_MARKER} ${candidate.label}`);
        }
        form.body(`${this.tabs.length}]${this.bodyText}`);

        const response: ActionFormResponse = await form.show(player);
        if (response.canceled || response.selection === undefined) {
            return { canceled: true, tabId: tab.id };
        }

        if (response.selection >= tab.buttons.length) {
            const tabIndex = response.selection - tab.buttons.length;
            const nextTab = this.tabs[tabIndex] ?? tab;
            return this.show(player, nextTab.id);
        }

        const selectedButton = tab.buttons[response.selection];
        return {
            canceled: false,
            tabId: tab.id,
            action: selectedButton.action,
            value: selectedButton.value
        };
    }
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add scripts/ui/form/common/TabbedActionForm.ts
git commit -m "feat: add tabbed action form"
```

---

## Task 6: Rewrite Shop Controller

**Files:**
- Modify: `scripts/ui/form/shop/Shop.ts`

- [ ] **Step 1: Replace the money shop with point shop rendering**

Replace `scripts/ui/form/shop/Shop.ts` with:

```typescript
import { PhaseManager } from "../../../modules/core/gamephase/PhaseManager";
import { MemberManager } from "../../../modules/player/MemberManager";
import { LoadoutError, LoadoutManager } from "../../../modules/core/LoadoutManager";
import { EquipmentPointManager } from "../../../modules/core/EquipmentPointManager";

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

        for (const category of ShopCategories) form.tab(category.id, category.label);

        for (const product of ShopCatalogLookup.getProductsByCategory("primary")) addProductButton(form, player, product, pointLimit);
        for (const product of ShopCatalogLookup.getProductsByCategory("secondary")) addProductButton(form, player, product, pointLimit);
        for (const product of ShopCatalogLookup.getProductsByCategory("throwable")) addProductButton(form, player, product, pointLimit);
        for (const product of ShopCatalogLookup.getProductsByCategory("armor")) addProductButton(form, player, product, pointLimit);

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
        loadout.primary,
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
        ? ` x${LoadoutManager.getThrowableAmount(player, product.id)}/${(product as ItemShopProduct).maxAmount}`
        : "";
    const remaining = LoadoutManager.getAvailablePoints(player, pointLimit);
    const label = `${product.name}${suffix} ${FC.Yellow}${product.pointCost}P\n${FC.DarkGray}${L.translate("shop.remaining_points", remaining)}`;
    form.button(product.category, {
        text: label,
        iconPath: product.iconPath,
        action: "select_product",
        value: product.id
    });
}

function addThrowableControls(form: TabbedActionForm<ShopAction>, player: Player) {
    const throwableProducts = ShopCatalogLookup.getProductsByCategory("throwable") as ItemShopProduct[];
    for (const product of throwableProducts) {
        if (LoadoutManager.getThrowableAmount(player, product.id) <= 0) continue;
        form.button("throwable", {
            text: L.translate("shop.throwable.remove", product.name),
            action: "remove_throwable",
            value: product.id
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

    if (product.category === "primary") LoadoutManager.setPrimary(player, product.id, pointLimit);
    else if (product.category === "secondary") LoadoutManager.setSecondary(player, product.id, pointLimit);
    else if (product.category === "throwable") LoadoutManager.addThrowable(player, product.id, pointLimit);
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
```

- [ ] **Step 2: Run build and capture missing language keys**

Run: `npm run build`

Expected: FAIL only if `LanguageKey` does not yet include new shop keys. Continue to Task 7 to add keys. If it fails for import paths or type errors, fix those exact paths before moving on.

- [ ] **Step 3: Commit after Task 7 passes**

Do not commit this task alone if build fails for missing language keys. Commit with Task 7 after language keys are added.

---

## Task 7: Update Shop Language Keys

**Files:**
- Modify: `scripts/settings/lang/zh_TW.ts`
- Verify: `scripts/settings/lang/LanguageKey.d.ts`

- [ ] **Step 1: Add language keys in `zh_TW.ts`**

Replace the existing `shop.*` entries with these keys:

```typescript
"shop.title": "商店",
"shop.body": [
    `裝備點數：${FC.MinecoinGold}%1/%2`,
    `主武器：${FC.Green}%3`,
    `副武器：${FC.Green}%4`,
    `護甲：${FC.Green}%5`,
    `投擲物：${FC.Green}%6`
],
"shop.remaining_points": "剩餘 %1P",
"shop.throwable.remove": "移除 %1 x1",
"shop.throwable.clear": "清空投擲物 (%1/%2)",
"shop.error.prefix": `${FC.Red}%1。`,
"shop.error.no_points": "裝備點數不足",
"shop.error.item_limit_reached": "已達到該裝備上限",
"shop.error.throwable_total_limit_reached": "已達到投擲物總上限",
"shop.error.product_not_found": "找不到該商品",
"shop.error.not_buying": "只能在購買階段開啟商店",
"shop.loadout.reset": "上一回合配置超出本回合點數上限，已重置部分裝備。",
```

- [ ] **Step 2: Verify derived language key typing**

Open `scripts/settings/lang/LanguageKey.d.ts` and verify it still derives keys from `zh_TW`:

```typescript
import { zh_TW } from "./zh_TW";

export type LanguageKey = keyof typeof zh_TW;
```

Do not manually duplicate shop keys in this file. Adding the keys to `zh_TW.ts` is enough for the `LanguageKey` type.

- [ ] **Step 3: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Commit Task 6 and Task 7 together**

```bash
git add scripts/ui/form/shop/Shop.ts scripts/settings/lang/zh_TW.ts scripts/settings/lang/LanguageKey.d.ts
git commit -m "feat: rewrite shop for equipment points"
```

---

## Task 8: Integrate Loadouts Into Round Lifecycle

**Files:**
- Modify: `scripts/modules/core/gamephase/bomb_plant/Idle.ts`
- Modify: `scripts/modules/core/gamephase/bomb_plant/PreRoundStart.ts`
- Modify: `scripts/modules/core/gamephase/bomb_plant/Buying.ts`

- [ ] **Step 1: Replace player economy initialization in `Idle.ts`**

Remove:

```typescript
import { EconomyManager } from "../../EconomyManager";
```

Add:

```typescript
import { LoadoutManager } from "../../LoadoutManager";
```

Replace:

```typescript
EconomyManager.initializePlayer(player);
```

with:

```typescript
LoadoutManager.initializePlayer(player);
```

- [ ] **Step 2: Sanitize and apply loadout in `PreRoundStart.ts`**

Add imports:

```typescript
import { EquipmentPointManager } from "../../EquipmentPointManager";
import { LoadoutManager } from "../../LoadoutManager";
import { variable } from "../../../../utils/Variable";
import { Language as L } from "../../../../utils/Language";
```

Inside `initializePlayers()`, after player tags are set, add:

```typescript
const pointLimit = EquipmentPointManager.getPointLimit(variable("attacker_score"), variable("defender_score"));
const reset = LoadoutManager.sanitizeForCurrentRound(player, pointLimit);
if (reset) player.sendMessage(L.translate("shop.loadout.reset"));
```

Keep the existing visual armor assignment in `resetPlayerInventory()`.

- [ ] **Step 3: Remove purchase history from `Buying.ts`**

Remove:

```typescript
import { PurchaseHistory } from "../../../../ui/form/shop/Shop";
```

Remove:

```typescript
PurchaseHistory.clearAll();
```

Keep the feather shop item behavior.

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/modules/core/gamephase/bomb_plant/Idle.ts scripts/modules/core/gamephase/bomb_plant/PreRoundStart.ts scripts/modules/core/gamephase/bomb_plant/Buying.ts
git commit -m "feat: integrate loadouts with round start"
```

---

## Task 9: Remove Economy Rewards

**Files:**
- Modify: `scripts/modules/core/gamephase/bomb_plant/RoundEnd.ts`
- Modify: `scripts/modules/player/PlayerDeathHandler.ts`
- Modify: `scripts/modules/core/c4state/states/Planted.ts`

- [ ] **Step 1: Remove round income from `RoundEnd.ts`**

Remove:

```typescript
import { EconomyManager } from "../../EconomyManager";
```

Remove:

```typescript
const INCOME = [3500, 2200];
```

In `switchSide()`, remove:

```typescript
EconomyManager.setMoney(player, 800);
```

In `processWinner()`, remove:

```typescript
for (const player of MemberManager.getPlayers()) {
    const playerTeam = MemberManager.getPlayerTeam(player);
    const earn = INCOME[(playerTeam === winnerTeam) ? 0 : 1];
    EconomyManager.modifyMoney(player, earn);
}
```

- [ ] **Step 2: Remove kill reward from `PlayerDeathHandler.ts`**

Remove:

```typescript
import { EconomyManager } from "../core/EconomyManager";
```

Remove:

```typescript
EconomyManager.setMoney(ev.attacker, EconomyManager.getMoney(ev.attacker) + 200);
```

- [ ] **Step 3: Remove bomb plant reward from `Planted.ts`**

Remove:

```typescript
import { EconomyManager } from "../../EconomyManager";
```

Remove:

```typescript
for (const player of MemberManager.getPlayers({team: TeamEnum.Attacker})) {
    EconomyManager.setMoney(player, EconomyManager.getMoney(player) + 300);
}
```

- [ ] **Step 4: Run economy import search**

Run: `rg -n "EconomyManager|modifyMoney|getMoney|setMoney|initializePlayer\\(" scripts`

Expected: no `EconomyManager`, `modifyMoney`, `getMoney`, or `setMoney` matches. `initializePlayer` matches for `LoadoutManager` are acceptable.

- [ ] **Step 5: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/modules/core/gamephase/bomb_plant/RoundEnd.ts scripts/modules/player/PlayerDeathHandler.ts scripts/modules/core/c4state/states/Planted.ts
git commit -m "feat: remove money economy rewards"
```

---

## Task 10: Remove Old Money Shop Files

**Files:**
- Delete: `scripts/modules/core/EconomyManager.ts`
- Delete: `scripts/ui/form/shop/ProductTable.ts`

- [ ] **Step 1: Verify old files are unused**

Run: `rg -n "EconomyManager|ProductTable|PurchaseHistory|price|no_money|refund" scripts`

Expected: no matches in TypeScript source except unrelated English words in comments. If `price`, `no_money`, or `refund` appear in old language keys, remove those keys in this task.

- [ ] **Step 2: Delete old files**

Delete:

```text
scripts/modules/core/EconomyManager.ts
scripts/ui/form/shop/ProductTable.ts
```

- [ ] **Step 3: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add scripts/modules/core/EconomyManager.ts scripts/ui/form/shop/ProductTable.ts scripts/settings/lang/zh_TW.ts scripts/settings/lang/LanguageKey.d.ts
git commit -m "refactor: remove old money shop files"
```

---

## Task 11: Final Validation

**Files:**
- Modify only if validation exposes defects in files changed by previous tasks.

- [ ] **Step 1: Run lint**

Run: `npm run lint`

Expected: PASS. If lint fails only because of pre-existing unrelated files, record those exact files and run `npm run build` before handoff.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Search for old economy vocabulary**

Run: `rg -n "money|Money|economy|Economy|price|refund|no_money|ECO|800|9000|3500|2200" scripts docs README.md`

Expected: no stale money-economy references in active implementation files. Documentation references may remain only if they intentionally describe removed behavior and are updated in a follow-up docs task.

- [ ] **Step 4: Manual in-game smoke checklist**

Run a local deploy if the development environment is configured:

```bash
npm run local-deploy
```

Manual checks in Minecraft:

- Round 1 shop shows `2` points.
- Round 2 shop shows `3` points.
- Buying AK47 in Round 1 fails with point error.
- Buying P90 in Round 2 succeeds.
- Flashbang can reach `x2`; third flash fails.
- Smoke can reach `x1`; second smoke fails.
- Total throwables stop at `4`.
- Remove throwable frees points.
- Clear throwables frees all throwable points.
- Light armor reduces all bullet damage by 15%.
- Heavy armor reduces all bullet damage by 30%.
- Visual team armor remains unchanged after buying hidden armor.
- Kills, bomb plants, round wins, round losses, and side switch do not change equipment points.

- [ ] **Step 5: Commit validation fixes**

If validation required fixes:

```bash
git add <changed-files>
git commit -m "fix: stabilize equipment point shop"
```

If validation required no fixes, do not create an empty commit.
