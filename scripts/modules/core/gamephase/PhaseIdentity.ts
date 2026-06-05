export const PhaseIdentity = {
    Deathmatch: {
        Idle: 'deathmatch.idle',
        PreStart: 'deathmatch.pre_start',
        Action: 'deathmatch.action',
        Gameover: 'deathmatch.gameover',
    },
} as const;

export type PhaseIdentityId =
    (typeof PhaseIdentity.Deathmatch)[keyof typeof PhaseIdentity.Deathmatch];
