import { MemberManager } from "../../../../gameroom/member/MemberManager";
import { GrenadeHandler } from "./GrenadeHandler";

import { EntityActor } from "../../../actors/Actor";

import { Player, system, Vector3 } from "@minecraft/server";
import { Vector3Builder, Vector3Utils } from "@minecraft/math";

export class FlashbangHandler extends GrenadeHandler {

    private readonly BlindLevels = [
        { min: 0, max: 50, duration: 1.8, fadeOut: 4.5 },
        { min: 50, max: 75, duration: 1, fadeOut: 3.7 },
        { min: 75, max: 135, duration: 0.75, fadeOut: 2.5 },
    ];

    constructor(actor: EntityActor) {
        super(actor);

        const grenadeComp = actor.getComponent('grenade')!;
        system.runTimeout(() => this.execute(), grenadeComp.executeDelay);
    }

    execute() {        
        for (const player of MemberManager.getPlayers({ is_alive: true })) {
            const raycast = this.detectObstacle(player);
            if (raycast === undefined) {
                const blindLevel = this.getBlindLevel(player);
                this.applyBlindEffect(player, blindLevel.duration, blindLevel.fadeOut);
            }
        }

        super.execute();
    }
    
    private detectObstacle(player: Player) {
        const dimension = player.dimension;
        const location = this.entityActor.entity.location;
        const eyeLocation = Vector3Utils.add(player.getHeadLocation(), {y: 0.1});
        
        const connectVector = new Vector3Builder(Vector3Utils.subtract(location, eyeLocation));
        const magnitude = connectVector.magnitude();
        
        const raycast = dimension.getBlockFromRay(eyeLocation, connectVector.normalize(), { 
            maxDistance: magnitude,
            includeLiquidBlocks: false
        });
        return raycast;
    }

    private getBlindLevel(player: Player) {

        const flatten = (vec: Vector3) => new Vector3Builder(vec.x, 0, vec.z);

        const entityLocation2d = flatten(this.entityActor.entity.location);
        const headLocation2d = flatten(player.getHeadLocation());
        const viewDirection2d = flatten(player.getViewDirection());
        const connect = new Vector3Builder(entityLocation2d).subtract(headLocation2d);

        const dot = Vector3Utils.dot(viewDirection2d, connect);
        const rad = Math.acos(dot / (viewDirection2d.magnitude() * connect.magnitude()));
        const deg = rad * (180 / Math.PI);
        
        for (const level of this.BlindLevels) {
            if (deg >= level.min && deg <= level.max) {
                return { duration: level.duration, fadeOut: level.fadeOut };
            }
        }
        return { duration: 0.1, fadeOut: 1 };
    }

    private applyBlindEffect(player: Player, duration: number, fadeOut: number) {
        player.camera.fade({
            fadeColor: {
                red: 1,
                green: 0.95,
                blue: 0.95
            },
            fadeTime: {
                fadeInTime: 0.1,
                holdTime: duration,
                fadeOutTime: fadeOut
            }
        });
    }
}