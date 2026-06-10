import { Player, system } from '@minecraft/server';
import { LoadoutError, LoadoutManager } from '../../../modules/core/LoadoutManager';
import { DeathmatchLoadout } from '../../../modules/core/gamemodes/Deathmatch/DeathmatchLoadout';
import { entity_dynamic_property } from '../../../utils/Property';
import { FormatCode as FC } from '../../../utils/FormatCode';
import { Sound } from '../../media/Sound';
import { TabbedActionForm } from '../common/TabbedActionForm';
import { ShopCatalogLookup } from './ShopCatalog';
import { ShopCategoryId, ShopProduct } from './ShopTypes';

type DeathmatchShopAction = 'select_product';
type DeathmatchTabId = Extract<ShopCategoryId, 'primary' | 'secondary'>;

const SHOP_OPEN_SOUND_ID = 'ui.chest_open';
const SHOP_CLOSE_SOUND_ID = 'ui.chest_close';
const SHOP_YES_SOUND_ID = 'mob.villager.yes';
const SHOP_NO_SOUND_ID = 'mob.villager.no';

export class DeathmatchShop {
    static async open(
        player: Player,
        tabId: DeathmatchTabId = 'primary',
        playOpenSound = true,
        canOpen: () => boolean = () => true
    ) {
        if (!player.isValid) return;
        if (!canOpen()) return;

        if (playOpenSound) Sound.playTo(SHOP_OPEN_SOUND_ID, player);

        const bodyText = buildBody(player);
        const form = new TabbedActionForm<DeathmatchShopAction>().title('Deathmatch Shop');

        form.tab('primary', 'Primary');
        form.tab('secondary', 'Secondary');

        for (const category of ['primary', 'secondary'] as DeathmatchTabId[]) {
            for (const product of ShopCatalogLookup.getProductsByCategory(category)) {
                addProductButton(form, player, product);
            }
        }

        const response = await form.body(bodyText).show(player, tabId);
        if (response.canceled || !response.value) {
            Sound.playTo(SHOP_CLOSE_SOUND_ID, player);
            return;
        }

        try {
            handleProduct(player, response.value);
            Sound.playTo(SHOP_YES_SOUND_ID, player);
        } catch (err: any) {
            player.sendMessage(FC.Red + (err instanceof LoadoutError ? err.message : 'Product not found'));
            Sound.playTo(SHOP_NO_SOUND_ID, player);
        }

        system.run(() => this.open(player, response.tabId as DeathmatchTabId, false, canOpen));
    }
}

function buildBody(player: Player) {
    const loadout = LoadoutManager.describeLoadout(player);
    return [
        '---',
        `${FC.White}Primary: ${FC.Green}${loadout.primary}`,
        `${FC.White}Secondary: ${FC.Green}${loadout.secondary}`,
        `${FC.White}---`,
    ].join('\n');
}

function addProductButton(form: TabbedActionForm<DeathmatchShopAction>, player: Player, product: ShopProduct) {
    const selectedName = LoadoutManager.isProductSelected(player, product)
        ? `${FC.Green}>${product.name}<`
        : product.name;

    form.button(product.category, {
        text: selectedName,
        iconPath: product.iconPath,
        action: 'select_product',
        value: product.productId,
    });
}

function handleProduct(player: Player, productId: string) {
    const product = ShopCatalogLookup.getProduct(productId);
    if (!product) throw new LoadoutError('shop.error.product_not_found');

    if (product.category === 'primary') LoadoutManager.setPrimaryFree(player, product.productId);
    else if (product.category === 'secondary') LoadoutManager.setSecondaryFree(player, product.productId);
    else throw new LoadoutError('shop.error.product_not_found');

    if (!entity_dynamic_property(player, 'player:is_alive')) return;
    LoadoutManager.applyCurrentHotbar(player);
    DeathmatchLoadout.restockThrowables(player);
}
