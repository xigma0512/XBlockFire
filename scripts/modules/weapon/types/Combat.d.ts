declare type BulletHitType = 'head' | 'body' | 'legs'
declare type DamageDistanceType = 'near' | 'medium' | 'far'

declare interface IDamageTable {
    head: number;
    body: number;
    legs: number;
}