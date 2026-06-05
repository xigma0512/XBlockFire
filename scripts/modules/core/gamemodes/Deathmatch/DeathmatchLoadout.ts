import { EquipmentSlot, ItemLockMode, Player } from '@minecraft/server';
import { TeamEnum } from '../../../player/TeamEnum';
import { MemberManager } from '../../../player/MemberManager';
import { LoadoutManager } from '../../LoadoutManager';
import { HotbarManager } from '../../../../ui/hotbar/Hotbar';
import { ItemStackFactory } from '../../../../utils/ItemStackFactory';
import { UnCommonItems } from '../../../combat/ItemManager';
import { DeathmatchConfig } from './DeathmatchConfig';

export class DeathmatchLoadout {
    static apply(player: Player) {
        LoadoutManager.setArmorFree(player, DeathmatchConfig.ARMOR_TIER);
        LoadoutManager.clearThrowables(player);
        LoadoutManager.applyCurrentHotbar(player);
        this.applyShopItem(player);
        this.applyTeamArmor(player);
    }

    static applyShopItem(player: Player) {
        const hotbar = HotbarManager.getPlayerHotbar(player);
        hotbar.items[8] = ItemStackFactory.new({
            typeId: DeathmatchConfig.SHOP_ITEM_ID,
            lockMode: ItemLockMode.slot,
        });
        HotbarManager.sendHotbar(player, hotbar);
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
}
