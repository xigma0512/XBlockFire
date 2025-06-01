import { ItemComponent } from "../../components/ItemComponent";
import { ItemActor } from "../Actor";

import { ItemLockMode, ItemStack } from "@minecraft/server";

export class Glock17 extends ItemActor {

    constructor() {
        super('glock17', new ItemStack('xblockfire:glock17', 1));
        
        this.components
            .set('item', new ItemComponent({
                nametag: 'Glock17',
                lore: [ "I'M A GUN!!!" ],
                keepOnDeath: true,
                lockMode: ItemLockMode.slot,
                canPlaceOn: [],
                canDestroy: []
            }));
        
        this.setItem();
    }
}