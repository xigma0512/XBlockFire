import { gameroom } from '../core/GameRoom';
import { MemberManager } from './MemberManager';

import { Vector3Builder, Vector3Utils } from '@minecraft/math';
import { Direction, MolangVariableMap, Player, RGBA } from '@minecraft/server';

export class AlliesMarker {
    static updateMark() {
        const players = MemberManager.getPlayers();
        for (const viewer of players) {
            const team = MemberManager.getPlayerTeam(viewer);
            const is_alive = true;
            const groupPlayers = MemberManager.getPlayers({ team, is_alive });

            for (const ally of groupPlayers) {
                if (ally.id === viewer.id) continue;

                const targetLoc = Vector3Utils.add(ally.location, { y: 2.3 });
                const transform = this.getMarkerTransform(viewer, targetLoc);
                if (!transform) continue;

                const varMap = this.getVarMap(transform.size);
                viewer.spawnParticle('xblockfire:allies_mark', transform.location, varMap);
            }
            gameroom().activeMode.onAlliesMarkerUpdate?.(viewer, groupPlayers);
        }
    }

    static getMarkerTransform(viewer: Player, targetLocation: { x: number; y: number; z: number }) {
        const headLoc = viewer.getHeadLocation();

        const eyeToTarget = Vector3Utils.subtract(targetLocation, headLoc);
        const distanceToTarget = Vector3Utils.magnitude(eyeToTarget);

        if (distanceToTarget <= 2) return null;

        const dimension = viewer.dimension;
        const raycastVector = new Vector3Builder(eyeToTarget);
        const raycastResult = dimension.getBlockFromRay(headLoc, raycastVector, {
            includeLiquidBlocks: false,
            includePassableBlocks: false,
            maxDistance: distanceToTarget,
        });

        let finalLocation = targetLocation;
        let size = 0.2;

        if (raycastResult) {
            const blockLoc = raycastResult.block.location;
            const face = raycastResult.face;

            let hitX = blockLoc.x + raycastResult.faceLocation.x;
            let hitY = blockLoc.y + raycastResult.faceLocation.y;
            let hitZ = blockLoc.z + raycastResult.faceLocation.z;

            if (face === Direction.East) hitX = blockLoc.x + 1;
            else if (face === Direction.West) hitX = blockLoc.x;
            else if (face === Direction.Up) hitY = blockLoc.y + 1;
            else if (face === Direction.Down) hitY = blockLoc.y;
            else if (face === Direction.South) hitZ = blockLoc.z + 1;
            else if (face === Direction.North) hitZ = blockLoc.z;

            const hitLocation = { x: hitX, y: hitY, z: hitZ };

            const faceNormals: Record<Direction, { x: number; y: number; z: number }> = {
                [Direction.Up]: { x: 0, y: 1, z: 0 },
                [Direction.Down]: { x: 0, y: -1, z: 0 },
                [Direction.South]: { x: 0, y: 0, z: 1 },
                [Direction.North]: { x: 0, y: 0, z: -1 },
                [Direction.East]: { x: 1, y: 0, z: 0 },
                [Direction.West]: { x: -1, y: 0, z: 0 },
            };
            const normal = faceNormals[face];
            const toViewerDir = Vector3Utils.normalize(Vector3Utils.subtract(headLoc, hitLocation));

            finalLocation = Vector3Utils.add(
                hitLocation,
                Vector3Utils.add(Vector3Utils.scale(normal, 0.1), Vector3Utils.scale(toViewerDir, 0.1))
            );

            const distanceToParticle = Vector3Utils.distance(headLoc, finalLocation);
            size = 0.2 * (distanceToParticle / distanceToTarget);
            size = Math.max(0.01, size);
        }

        return {
            location: finalLocation,
            size: size,
        };
    }

    static getVarMap(size: number, color?: RGBA) {
        const varMap = new MolangVariableMap();

        varMap.setColorRGBA(
            'color',
            color ?? {
                red: 0,
                green: 1,
                blue: 0,
                alpha: 1,
            }
        );

        varMap.setFloat('width', size);
        varMap.setFloat('height', size);

        return varMap;
    }
}
