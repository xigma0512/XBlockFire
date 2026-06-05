import { Player, system } from '@minecraft/server';
import { PhaseIdentity } from '../../../modules/core/gamephase/PhaseIdentity';
import { PhaseManager } from '../../../modules/core/gamephase/PhaseManager';
import { LoadoutError, LoadoutManager } from '../../../modules/core/LoadoutManager';
import { entity_dynamic_property } from '../../../utils/Property';
import { FormatCode as FC } from '../../../utils/FormatCode';
import { Sound } from '../../media/Sound';
import { TabbedActionForm } from '../common/TabbedActionForm';
import { ShopCatalogLookup, ShopCategoryId, ShopProduct } from './ShopCatalog';

type DeathmatchShopAction = 'select_product';
type DeathmatchTabId = Extract<ShopCategoryId, 'primary' | 'secondary'>;

export class DeathmatchShop {
    static async open(player: Player, tabId: DeathmatchTabId = 'primary', playOpenSound = true) {
        if (PhaseManager.getPhase().phaseId !== PhaseIdentity.Deathmatch.Action) {
            player.sendMessage(`${FC.Red}Deathmatch shop is only available during action.`);
            return;
        }

        if (playOpenSound) Sound.play('SHOP_OPEN', player);

        const form = new TabbedActionForm<DeathmatchShopAction>().title('Deathmatch Shop').body(buildBody(player));

        form.tab('primary', 'Primary');
        form.tab('secondary', 'Secondary');

        for (const category of ['primary', 'secondary'] as DeathmatchTabId[]) {
            for (const product of ShopCatalogLookup.getProductsByCategory(category)) {
                addProductButton(form, player, product);
            }
        }

        const response = await form.show(player, tabId);
        if (response.canceled || !response.value) {
            Sound.play('SHOP_CLOSE', player);
            return;
        }

        try {
            handleProduct(player, response.value);
            Sound.play('SHOP_YES', player);
        } catch (err: any) {
            player.sendMessage(FC.Red + (err instanceof LoadoutError ? err.message : 'Product not found'));
            Sound.play('SHOP_NO', player);
        }

        system.run(() => this.open(player, response.tabId as DeathmatchTabId, false));
    }
}

function buildBody(player: Player) {
    const loadout = LoadoutManager.describeLoadout(player);
    return ['---', `${FC.Green}Primary: ${loadout.primary}`, `${FC.Green}Secondary: ${loadout.secondary}`, '---'].join(
        '\n'
    );
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
}
