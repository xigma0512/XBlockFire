import type { Vector3 } from '@minecraft/server';

export function calculateFacingAngleDegrees(viewDirection: Vector3, connectVector: Vector3) {
    const view = flatten(viewDirection);
    const connect = flatten(connectVector);
    const denominator = magnitude(view) * magnitude(connect);
    if (denominator <= 0) return 180;

    const cosine = clamp(dot(view, connect) / denominator, -1, 1);
    return Math.acos(cosine) * (180 / Math.PI);
}

function flatten(vector: Vector3): Vector3 {
    return { x: vector.x, y: 0, z: vector.z };
}

function dot(a: Vector3, b: Vector3) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function magnitude(vector: Vector3) {
    return Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}
