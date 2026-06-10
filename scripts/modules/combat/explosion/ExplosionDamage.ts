export interface ExplosionDamageOptions {
    distance: number;
    radius: number;
    minDamage: number;
    maxDamage: number;
}

export function calculateExplosionDamage(options: ExplosionDamageOptions) {
    const { distance, radius, minDamage, maxDamage } = options;
    if (radius <= 0 || distance > radius) return 0;

    const falloff = Math.max(0, Math.min(1, distance / radius));
    return Math.round(maxDamage - (maxDamage - minDamage) * falloff);
}
