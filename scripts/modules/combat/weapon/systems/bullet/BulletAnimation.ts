import { Vector3Utils } from '@minecraft/math';
import { BlockRaycastHit, Direction, Player, Vector3, world } from '@minecraft/server';

export class BulletAnimation {
    private static readonly GUN_OFFSET = { right: -0.45, up: 0.1, forward: 1.5 };
    private static readonly STEP = 0.5;

    static spawnBulletEffects(shooter: Player, hitLocation: Vector3, raycast?: BlockRaycastHit) {
        if (raycast) {
            this.spawnBulletHole(raycast);
        }

        const muzzlePos = this.getOffsetLocation(shooter, this.GUN_OFFSET);

        for (const viewer of world.getAllPlayers()) {
            this.showTraceToViewer(viewer, shooter, muzzlePos, hitLocation);
        }
    }

    private static showTraceToViewer(viewer: Player, shooter: Player, muzzlePos: Vector3, hitLocation: Vector3) {
        const isShooter = viewer.id === shooter.id;
        const totalDist = Vector3Utils.distance(muzzlePos, hitLocation);

        let displayStart = muzzlePos;

        if (isShooter) {
            if (totalDist <= 2) return;
            const lerpFactor = 2 / totalDist;
            displayStart = Vector3Utils.lerp(muzzlePos, hitLocation, lerpFactor);
        }

        this.renderTraceLine(viewer, displayStart, hitLocation);
    }

    private static getOffsetLocation(player: Player, offset: { right: number; up: number; forward: number }): Vector3 {
        const viewDir = player.getViewDirection();
        const eyePos = player.getHeadLocation();

        let right = { x: viewDir.z, y: 0, z: -viewDir.x };
        const mag = Math.sqrt(right.x ** 2 + right.z ** 2);

        if (mag < 0.001) {
            const rotation = player.getRotation();
            const radYaw = (rotation.y + 90) * (Math.PI / 180);
            right = { x: -Math.sin(radYaw), y: 0, z: Math.cos(radYaw) };
        } else {
            right.x /= mag;
            right.z /= mag;
        }

        const up = Vector3Utils.cross(right, viewDir);

        return {
            x: eyePos.x + viewDir.x * offset.forward + right.x * offset.right + up.x * offset.up,
            y: eyePos.y + viewDir.y * offset.forward + right.y * offset.right + up.y * offset.up,
            z: eyePos.z + viewDir.z * offset.forward + right.z * offset.right + up.z * offset.up,
        };
    }

    private static renderTraceLine(viewer: Player, start: Vector3, end: Vector3) {
        const distance = Vector3Utils.distance(start, end);
        if (distance === 0) return;

        const step = this.STEP;
        const count = Math.floor(distance / step);

        for (let i = 0; i <= count; i++) {
            const pos = Vector3Utils.lerp(start, end, (i * step) / distance);
            try {
                viewer.dimension.spawnParticle('xblockfire:bullet_trajectory', pos);
            } catch {}
        }
    }

    private static spawnBulletHole(raycast: BlockRaycastHit) {
        const offsetValue = 0.02;
        const particleOffset = {
            [Direction.Up]: { y: 1 + offsetValue },
            [Direction.Down]: { y: -offsetValue },
            [Direction.South]: { z: 1 + offsetValue },
            [Direction.North]: { z: -offsetValue },
            [Direction.East]: { x: 1 + offsetValue },
            [Direction.West]: { x: -offsetValue },
        };

        const particleTypes = {
            [Direction.Up]: 'xblockfire:bullet_hole_xz',
            [Direction.Down]: 'xblockfire:bullet_hole_xz',
            [Direction.South]: 'xblockfire:bullet_hole_xy',
            [Direction.North]: 'xblockfire:bullet_hole_xy',
            [Direction.East]: 'xblockfire:bullet_hole_yz',
            [Direction.West]: 'xblockfire:bullet_hole_yz',
        };

        const hitLocation = Vector3Utils.add(raycast.block, raycast.faceLocation);
        const spawnLocation = Vector3Utils.add(hitLocation, particleOffset[raycast.face]);

        try {
            raycast.block.dimension.spawnParticle(particleTypes[raycast.face], spawnLocation);
        } catch {}
    }
}
