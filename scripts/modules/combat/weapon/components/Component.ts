import { GunComponent } from './gun/GunComponent';
import { GunDamageComponent } from './gun/GunDamageComponent';
import { GunFireComponent } from './gun/GunFireComponent';
import { GunMagazineComponent } from './gun/GunMagazineComponent';
import { GunOffsetComponent } from './gun/GunOffsetComponent';
import { GunRaiseComponent } from './gun/GunRaiseComponent';
import { GunRecoilComponent } from './gun/GunRecoilComponent';
import { GunReloadComponent } from './gun/GunReloadComponent';

import { ItemComponent } from './ItemComponent';
import { ItemWeightComponent } from './ItemWeightComponent';

import { EntityComponent } from './EntityComponent';

import { GrenadeComponent } from './GrenadeComponent';
import { ProjectileReboundComponent } from './ProjectileReboundComponent';

export type ComponentTypes = {
    gun: GunComponent;
    gun_fire: GunFireComponent;
    gun_recoil: GunRecoilComponent;
    gun_reload: GunReloadComponent;
    gun_offset: GunOffsetComponent;
    gun_magazine: GunMagazineComponent;
    gun_damage: GunDamageComponent;
    gun_raise: GunRaiseComponent;

    item: ItemComponent;
    item_weight: ItemWeightComponent;

    entity: EntityComponent;
    projectile_rebound: ProjectileReboundComponent;
    grenade: GrenadeComponent;
};

export class Component {
    readonly componentId: keyof ComponentTypes;
    constructor(id: keyof ComponentTypes) {
        this.componentId = id;
    }
}
