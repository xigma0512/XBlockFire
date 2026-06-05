import { PhaseManager } from '../../../modules/core/gamephase/PhaseManager';
import { MemberManager } from '../../../modules/player/MemberManager';
import { EquipmentPointManager } from '../../../modules/core/gamemodes/BombPlant/EquipmentPointManager';
import { LoadoutError, LoadoutManager } from '../../../modules/core/LoadoutManager';
import { EconomyManager } from '../../../modules/core/gamemodes/BombPlant/EconomyManager';

import { PhaseEnum as BombPlantPhaseEnum } from '../../../modules/core/gamemodes/BombPlant/phases/BombPlantPhaseEnum';

import { FormatCode as FC } from '../../../utils/FormatCode';
import { Language as L } from '../../../utils/Language';
import { variable } from '../../../utils/Variable';
import { Sound } from '../../media/Sound';

import { Player, system, world } from '@minecraft/server';

import { gameroom } from '../../../modules/core/GameRoom';
import { TabbedActionForm } from '../common/TabbedActionForm';
import { ShopCatalogLookup, ShopCategories, THROWABLE_TOTAL_LIMIT } from './ShopCatalog';
import { ArmorShopProduct, ItemShopProduct, ShopCategoryId, ShopProduct } from './ShopTypes';

type ShopAction = 'select_product' | 'clear_primary' | 'clear_throwables';

const CLEAR_BUTTON_ICON = 'textures/blocks/barrier';

export class Shop {
    static async openShop(player: Player, tabId: ShopCategoryId = 'secondary', playOpenSound = true) {
        if (playOpenSound) Sound.play('SHOP_OPEN', player);

        const pointLimit = getCurrentPointLimit();
        const form = new TabbedActionForm<ShopAction>()
            .title(L.translate('shop.title'))
            .body(buildBody(player, pointLimit));

        for (const [category, label] of Object.entries(ShopCategories) as [ShopCategoryId, string][]) {
            form.tab(category, label);
        }

        addPrimaryControls(form);
        addThrowableControls(form, player);
        for (const category of Object.keys(ShopCategories) as ShopCategoryId[]) {
            for (const product of ShopCatalogLookup.getProductsByCategory(category)) {
                addProductButton(form, player, product, pointLimit);
            }
        }

        const response = await form.show(player, tabId);
        if (response.canceled || !response.action) {
            Sound.play('SHOP_CLOSE', player);
            return;
        }

        try {
            handleAction(player, response.action, response.value, pointLimit);
            Sound.play('SHOP_YES', player);
        } catch (err: any) {
            const key = err instanceof LoadoutError ? err.message : 'shop.error.product_not_found';
            player.sendMessage(FC.Red + L.translate(key as any));
            Sound.play('SHOP_NO', player);
        }

        system.run(() => this.openShop(player, response.tabId as ShopCategoryId, false));
    }
}

function getCurrentPointLimit() {
    return (
        gameroom().activeMode.getShopPointLimit?.(variable('attacker_score') || 0, variable('defender_score') || 0) ??
        EquipmentPointManager.getPointLimit(variable('attacker_score') || 0, variable('defender_score') || 0)
    );
}

function buildBody(player: Player, pointLimit: number) {
    const loadout = LoadoutManager.describeLoadout(player);
    return L.translate(
        'shop.body',
        pointLimit,
        `${FC.MinecoinGold}${pointLimit - EconomyManager.getUsedPoints(player)}`,
        `${FC.Green}${loadout.primary ?? '無'}`,
        `${FC.Green}${loadout.secondary}`,
        `${FC.Green}${loadout.throwables}`,
        `${FC.Green}${loadout.armor}`
    );
}

function addProductButton(
    form: TabbedActionForm<ShopAction>,
    player: Player,
    product: ShopProduct,
    pointLimit: number
) {
    const isSelected = (product_name: string) =>
        LoadoutManager.isProductSelected(player, product) ? `${FC.Green}>${product_name}<` : product_name;
    const canAfford = EconomyManager.canAffordProduct(player, product, pointLimit);
    const pointColor = canAfford ? FC.Yellow : FC.Red;
    const label = `${isSelected(getProductName(player, product))}\n${pointColor}${product.pointCost}P`;

    form.button(product.category, {
        text: label,
        iconPath: product.iconPath,
        action: 'select_product',
        value: product.productId,
    });
}

function getProductName(player: Player, product: ShopProduct) {
    if (product.category !== 'throwable') return product.name;

    const throwableProduct = product as ItemShopProduct;
    return `${product.name}(${LoadoutManager.getThrowableAmount(player, product.productId)}/${
        throwableProduct.maxAmount
    })`;
}

function addPrimaryControls(form: TabbedActionForm<ShopAction>) {
    form.button('primary', {
        text: FC.Red + L.translate('shop.primary.clear'),
        iconPath: CLEAR_BUTTON_ICON,
        action: 'clear_primary',
    });
}

function addThrowableControls(form: TabbedActionForm<ShopAction>, player: Player) {
    form.button('throwable', {
        text:
            FC.Red +
            L.translate('shop.throwable.clear', LoadoutManager.getThrowableTotal(player), THROWABLE_TOTAL_LIMIT),
        iconPath: CLEAR_BUTTON_ICON,
        action: 'clear_throwables',
    });
}

function handleAction(player: Player, action: ShopAction, value: string | undefined, pointLimit: number) {
    if (action === 'clear_primary') {
        LoadoutManager.clearPrimary(player);
        return;
    }

    if (action === 'clear_throwables') {
        LoadoutManager.clearThrowables(player);
        return;
    }

    if (!value) throw new LoadoutError('shop.error.product_not_found');

    const product = ShopCatalogLookup.getProduct(value);
    if (!product) throw new LoadoutError('shop.error.product_not_found');

    if (product.category === 'primary') EconomyManager.setPrimary(player, product.productId, pointLimit);
    else if (product.category === 'secondary') EconomyManager.setSecondary(player, product.productId, pointLimit);
    else if (product.category === 'throwable') EconomyManager.addThrowable(player, product.productId, pointLimit);
    else EconomyManager.setArmor(player, (product as ArmorShopProduct).armorTier, pointLimit);
}

world.beforeEvents.itemUse.subscribe((ev) => {
    if (ev.itemStack.typeId !== 'minecraft:feather') return;

    const player = ev.source;
    if (!MemberManager.includePlayer(player)) return;

    gameroom().activeMode.openShop?.(player);
});
