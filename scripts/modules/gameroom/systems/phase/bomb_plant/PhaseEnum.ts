export const enum BP_PhaseEnum {
    Idle,
    Buying,
    Action,
    RoundEnd,
    Gameover,
    BombPlanted
}

export const BP_PhaseEnumTable = {
    [BP_PhaseEnum.Idle]: "Waiting",
    [BP_PhaseEnum.Buying]: "Buying",
    [BP_PhaseEnum.Action]: "Action",
    [BP_PhaseEnum.RoundEnd]: "Round End",
    [BP_PhaseEnum.Gameover]: "Gameover",
    [BP_PhaseEnum.BombPlanted]: "Bomb has been planted",
}