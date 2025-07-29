import { Vector3Builder, Vector3Utils } from "@minecraft/math";
import { Vector3 } from "@minecraft/server";

export class OffsetCalculator {
    static addRandomOffset(originalVector: Vector3, uncertainty: number = 0) {

        const randemOffsetVector = new Vector3Builder(originalVector);

        const offsetX = (Math.random() * 2 - 1) * uncertainty;
        const offsetY = (Math.random() * 2 - 1) * uncertainty;
        const offsetZ = (Math.random() * 2 - 1) * uncertainty;

        randemOffsetVector.rotateX(offsetX);
        randemOffsetVector.rotateY(offsetY);
        randemOffsetVector.rotateZ(offsetZ);

        return Vector3Utils.normalize(randemOffsetVector);
    }

    static addVerticalOffset(originalVector: Vector3, uncertainty: number = 0) {
        const offsetVector = { x: 0, y: uncertainty, z: 0 };
        const result = Vector3Utils.add(originalVector, offsetVector);
        return Vector3Utils.normalize(result);
    }

    static addHorizontalRandomOffset(originalVector: Vector3, uncertainty: number = 0) {

        const offsetX = (Math.random() * 2 - 1) * uncertainty;
        const offsetZ = (Math.random() * 2 - 1) * uncertainty;

        const offsetVector = { x: offsetX, y: 0, z: offsetZ };
        const result = Vector3Utils.add(originalVector, offsetVector);
        return Vector3Utils.normalize(result);
    }
}