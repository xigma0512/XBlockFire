import { Player, Vector3, world, PlayerSoundOptions } from "@minecraft/server";
import { SoundKey, SoundRegistry } from "./SoundTable";

export type SoundTarget = Player | Player[] | undefined;

export class Sound {
    private static getPlayers(target: SoundTarget): Player[] {
        if (target === undefined) return world.getAllPlayers();
        return Array.isArray(target) ? target : [target];
    }

    /**
     * 播放註冊過的音效
     * @param soundKey 註冊表中的鍵名 (如 'SUCCESS')
     * @param target 目標玩家，預設為所有玩家
     * @param overrideOptions 可選的覆蓋設定 (如位置、音量等)
     */
    static play(soundKey: SoundKey, target?: SoundTarget, overrideOptions?: PlayerSoundOptions) {
        const soundDef = SoundRegistry[soundKey];
        if (!soundDef) return;

        const baseOptions = "options" in soundDef ? soundDef.options : {};
        const finalOptions: PlayerSoundOptions = { ...baseOptions, ...overrideOptions };

        for (const p of this.getPlayers(target)) {
            p.playSound(soundDef.id, finalOptions);
        }
    }

    /**
     * 在特定位置播放音效 (3D 空間音效)
     * @param soundKey 註冊表中的鍵名
     * @param location 播放的座標
     * @param target 目標玩家 (能聽到此位置音效的玩家)，預設為所有玩家
     * @param overrideOptions 可選的覆蓋設定
     */
    static playAt(soundKey: SoundKey, location: Vector3, target?: SoundTarget, overrideOptions?: PlayerSoundOptions) {
        this.play(soundKey, target, { ...overrideOptions, location });
    }

    static playSound(soundId: string, target?: SoundTarget, options?: PlayerSoundOptions) {
        for (const p of this.getPlayers(target)) {
            p.playSound(soundId, options || {});
        }
    }
}
