import { EquipmentSlot, ItemLockMode, Player } from '@minecraft/server';
import { ShopCatalogLookup } from '../../../../ui/form/shop/ShopCatalog';
import { ItemShopProduct } from '../../../../ui/form/shop/ShopTypes';
import { HotbarManager } from '../../../../ui/hotbar/Hotbar';
import { ItemStackFactory } from '../../../../utils/ItemStackFactory';
import { UnCommonItems } from '../../../combat/ItemManager';
import { MemberManager } from '../../../player/MemberManager';
import { TeamEnum } from '../../../player/TeamEnum';
import { LoadoutManager } from '../../LoadoutManager';
import { DeathmatchConfig } from './DeathmatchConfig';
import { getDeathmatchThrowableRestocks } from './DeathmatchThrowableRestock';

export class DeathmatchLoadout {
    static apply(player: Player) {
        this.clearObjectiveItems(player);
        LoadoutManager.setArmorFree(player, DeathmatchConfig.ARMOR_TIER);
        LoadoutManager.clearThrowables(player);
        LoadoutManager.applyCurrentHotbar(player);
        this.applyMeleeItem(player);
        this.restockThrowables(player);
        this.applyShopItem(player);
        this.applyTeamArmor(player);
    }

    static applyMeleeItem(player: Player) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        hotbar.items[2] = ItemStackFactory.new({
            typeId: DeathmatchConfig.MELEE_ITEM_ID,
            lockMode: ItemLockMode.slot,
        });
        HotbarManager.sendHotbar(player, hotbar);
    }

    static restockThrowables(player: Player) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        const throwableProducts = ShopCatalogLookup.getProductsByCategory('throwable') as ItemShopProduct[];
        const restocks = getDeathmatchThrowableRestocks(throwableProducts, hotbar.items);

        if (restocks.length === 0) return;

        for (const product of restocks) {
            if (!product.itemStackTypeId) continue;

            hotbar.items[product.slot] = ItemStackFactory.new({
                typeId: product.itemStackTypeId,
                amount: 1,
                lockMode: ItemLockMode.slot,
            });
        }

        HotbarManager.sendHotbar(player, hotbar);
    }

    static applyShopItem(player: Player) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        hotbar.items[8] = ItemStackFactory.new({
            typeId: DeathmatchConfig.SHOP_ITEM_ID,
            lockMode: ItemLockMode.slot,
        });
        HotbarManager.sendHotbar(player, hotbar);
    }

    static clearShopItem(player: Player) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        if (hotbar.items[8]?.typeId === DeathmatchConfig.SHOP_ITEM_ID) {
            hotbar.items[8] = undefined;
            HotbarManager.sendHotbar(player, hotbar);
        }
    }

    static applyTeamArmor(player: Player) {
        const team = MemberManager.getPlayerTeam(player);
        if (team !== TeamEnum.Attacker && team !== TeamEnum.Defender) return;

        const equippable = player.getComponent('equippable')!;
        if (team === TeamEnum.Attacker) {
            equippable.setEquipment(EquipmentSlot.Head, UnCommonItems.getItem('attacker_helmet'));
            equippable.setEquipment(EquipmentSlot.Chest, UnCommonItems.getItem('attacker_chestplate'));
            equippable.setEquipment(EquipmentSlot.Legs, UnCommonItems.getItem('attacker_leggings'));
            equippable.setEquipment(EquipmentSlot.Feet, UnCommonItems.getItem('attacker_boots'));
            return;
        }

        equippable.setEquipment(EquipmentSlot.Head, UnCommonItems.getItem('defender_helmet'));
        equippable.setEquipment(EquipmentSlot.Chest, UnCommonItems.getItem('defender_chestplate'));
        equippable.setEquipment(EquipmentSlot.Legs, UnCommonItems.getItem('defender_leggings'));
        equippable.setEquipment(EquipmentSlot.Feet, UnCommonItems.getItem('defender_boots'));
    }

    private static clearObjectiveItems(player: Player) {
        const container = player.getComponent('inventory')?.container;
        if (!container) return;

        for (let slot = 0; slot < container.size; slot++) {
            const item = container.getItem(slot);
            if (item?.typeId === 'xblockfire:c4' || item?.typeId === 'xblockfire:defuser') {
                container.setItem(slot, undefined);
            }
        }
    }
}
