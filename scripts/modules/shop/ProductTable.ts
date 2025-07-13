import { ItemActor } from "../../base/weapon/actors/Actor";
import { AK47 } from "../../base/weapon/actors/item/AK47";
import { M4A4 } from "../../base/weapon/actors/item/M4A4";
import { Glock17 } from "../../base/weapon/actors/item/Glock17";
import { Deagle } from "../../base/weapon/actors/item/Deagle";

export interface IProduct {
    id: number;

    price: number;
    max_amount: number;
    slot: number;
    
    itemActor?: (new () => ItemActor);
    itemStackTypeId?: string;
    
    name: string;
    description?: string;
    iconPath?: string;
}

export const ProductTable: IProduct[] = [
    {
        id: 0,
        
        price: 2900,
        max_amount: 1,
        slot: 0,
        
        itemActor: AK47,
        
        name: "AK47",
        description: "射速略低但傷害高的自動步槍。",
        iconPath: 'textures/items/gun/ak47'
    },
    {
        id: 1,

        price: 3000,
        max_amount: 1,
        slot: 0,
        
        itemActor: M4A4,
        
        name: "M4A4",
        description: "高射速但傷害略低的自動步槍",
        iconPath: 'textures/items/gun/m4a4'
    },
    {
        id: 100,

        price: 0,
        max_amount: 1,
        slot: 1,
        
        itemActor: Glock17,
        
        name: "Glock17",
        description: "初始手槍",
        iconPath: 'textures/items/gun/glock17'
    },
    {
        id: 101,
        
        price: 600,
        max_amount: 1,
        slot: 1,
        
        itemActor: Deagle,
        
        name: "Deagle",
        description: "高傷害，低射速的手槍",
        iconPath: 'textures/items/gun/deagle'
    },
    {
        id: 200,
        
        price: 200,
        max_amount: 2,
        slot: 4,
        
        itemStackTypeId: 'xblockfire:smoke_grenade_item',

        name: "SmokeGrenade",
        description: "能夠產生10秒左右的煙霧，切割戰場",
        iconPath: 'textures/items/grenade/smoke_grenade_item'
    },
    {
        id: 201,

        price: 350,
        max_amount: 2,
        slot: 5,
        
        itemStackTypeId: 'xblockfire:flashbang_item',
        
        name: "Flashbang",
        description: "閃瞎路徑上沒有遮擋物的所有玩家",
        iconPath: 'textures/items/grenade/flashbang_item'
    }
];