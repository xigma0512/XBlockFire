import { C4Manager } from "../../base/c4state/C4Manager";
import { MemberManager } from "../../base/gameroom/member/MemberManager";
import { C4StateEnum } from "../../types/bombstate/C4StateEnum";
import { TeamEnum } from "../../types/TeamEnum";

import { entity_dynamic_property } from "../../utils/Property";

import { Vector3Builder, Vector3Utils } from "@minecraft/math";
import { Direction, Entity, MolangVariableMap, Player, RGBA } from "@minecraft/server";

export class AlliesMarker {

    static updateMark() {
        const players = MemberManager.getPlayers();
        for (const viewer of players) {

            const team = entity_dynamic_property(viewer, 'player:team');
            const is_alive = entity_dynamic_property(viewer, 'player:is_alive');
            const groupPlayers = MemberManager.getPlayers({ team, is_alive });
            
            for (const ally of groupPlayers) {
                if (ally.id === viewer.id) continue;

                const { location, hasObstacle } = this.getSpawnLocation(viewer, ally);
                const size = this.getSize(viewer, ally, hasObstacle);
                const varMap = this.getVarMap(size);

                viewer.spawnParticle('xblockfire:allies_mark', location, varMap);
            }

            if (team === TeamEnum.Attacker) {
                const c4state = C4Manager.getHandler();
                if (c4state.stateTag === C4StateEnum.Dropped) {
                    const c4 = c4state.entity as Entity;

                    const { location, hasObstacle } = this.getSpawnLocation(viewer, c4);
                    const size = this.getSize(viewer, c4, hasObstacle);
                    const varMap = this.getVarMap(size, {
                        red: 0,
                        green: 0,
                        blue: 1,
                        alpha: 1
                    });

                    viewer.spawnParticle('xblockfire:allies_mark', location, varMap);
                }
            }
        }
    }

    private static getSpawnLocation(viewer: Player, ally: Entity) {
        const startLocation = Vector3Utils.add(viewer.getHeadLocation(), { y: 0.1 });
        const endLocation = Vector3Utils.add(ally.location, { y: 2.3 }); 

        const dimension = viewer.dimension;
        const raycastVector = new Vector3Builder(Vector3Utils.subtract(endLocation, startLocation));
        const raycastResult = dimension.getBlockFromRay(startLocation, raycastVector, {
            includeLiquidBlocks: false,
            includePassableBlocks: false,
            maxDistance: raycastVector.magnitude() + 1
        });

        if (raycastResult) {
            const blockLocation = raycastResult.block.location;
            const face = raycastResult.face;
            const faceLocation = raycastResult.faceLocation;

            const offsetValue = 0.2;
            const particleOffset = {
                [Direction.Up]: { y: 1 + offsetValue },
                [Direction.Down]: { y: -offsetValue },
                [Direction.South]: { z: 1 + offsetValue },
                [Direction.North]: { z: -offsetValue },
                [Direction.East]: { x: 1 + offsetValue },
                [Direction.West]: { x: -offsetValue }
            }
            const result = Vector3Utils.add(Vector3Utils.add(blockLocation, faceLocation), particleOffset[face]);
            return { location: result, hasObstacle: true };
        } else {
            return { location: endLocation, hasObstacle: false };
        }
    }

    private static getSize(viewer: Player, ally: Entity, hasObstacle: boolean) {
        const distance = Vector3Utils.distance(viewer.location, ally.location);

        const minSize = 0.02;
        const maxSize = 0.2;
        const maxDistance = 50;

        if (!hasObstacle) return maxSize;

        let scaledDistance = Math.min(distance, maxDistance);
        let scaleFactor = 1 - (scaledDistance / maxDistance); 

        let size = minSize + (maxSize - minSize) * scaleFactor;
        size = Math.max(minSize, Math.min(maxSize, size));
        return size;
    }

    private static getVarMap(size: number, color?: RGBA) {
        const varMap = new MolangVariableMap();

        varMap.setColorRGBA('color', color ?? {
            red: 0,
            green: 1,
            blue: 0,
            alpha: 1
        });

        varMap.setFloat('width', size);
        varMap.setFloat('height', size);

        return varMap;
    }
}