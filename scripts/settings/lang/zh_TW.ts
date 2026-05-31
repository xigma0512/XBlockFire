import { FormatCode as FC } from '../../utils/FormatCode';

const base_zh_TW = {
    'system.name': `${FC.Bold}${FC.Gold}XBlockFire`,

    'c4.dropped': `${FC.Bold}${FC.Gray}> ${FC.Blue}C4 已掉落。`,
    'c4.pickup.broadcast': `${FC.Bold}${FC.Gray}> ${FC.Yellow}玩家 %1 撿起了 C4。`,
    'c4.planted.title': `${FC.Bold}${FC.Red}<< C4 已被安裝 >>`,
    'c4.defuse.no_range': `${FC.Red}範圍內沒有 C4。`,

    'game.assigned.attacker': '你已被分配到 進攻方 (Attacker)。',
    'game.assigned.defender': '你已被分配到 防守方 (Defender)。',
    'game.wait_players': `${FC.Bold}${FC.Red}玩家人數不足，正在等待更多玩家...`,
    'game.switch_side.title': [
        `${FC.Bold}${FC.Gray}-----------`,
        `${FC.Bold}${FC.Gold}<< 攻守互換 >>`,
        `${FC.Bold}${FC.Gray}-----------`,
    ],
    'game.player_eliminated': `${FC.Bold}%1 %2 ${FC.DarkRed}淘汰了 %3 %4`,
    'game.killed_you': `${FC.Bold}${FC.Red}%1 擊殺了你`,

    'round.end.win': '[ 回合勝利 ]',
    'round.end.loss': '[ 回合失敗 ]',

    // Round End Messages
    'round.end.c4_defused': `${FC.Bold}${FC.Gray}>> ${FC.Red}C4已被拆除`,
    'round.end.time_up': `${FC.Bold}${FC.Gray}>> ${FC.Red}進攻方時間耗盡。`,
    'round.end.attacker_eliminated': `${FC.Bold}${FC.Gray}>> ${FC.Red}進攻方已全數被殲滅。`,
    'round.end.defender_eliminated': `${FC.Bold}${FC.Gray}>> ${FC.Red}防守方已全數被殲滅。`,
    'round.end.c4_detonated': `${FC.Bold}${FC.Gray}>> ${FC.Red}C4 已引爆！`,

    // Game Over Messages
    'game.over.attacker_disconnect': [
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ 遊戲結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Yellow}防守方獲勝`,
        `${FC.Bold}${FC.Gray}--------------------`,
    ],
    'game.over.defender_disconnect': [
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ 遊戲結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Yellow}進攻方獲勝`,
        `${FC.Bold}${FC.Gray}--------------------`,
    ],
    'game.over.attacker_win': [
        '',
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ 遊戲結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Yellow}進攻方獲勝`,
        `${FC.Bold}${FC.Gray}--------------------`,
        '',
    ],
    'game.over.defender_win': [
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ 遊戲結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Yellow}防守方獲勝。`,
        `${FC.Bold}${FC.Gray}--------------------`,
    ],

    'hud.waiting': `${FC.Yellow}等待更多玩家加入遊戲`,
    'hud.start_in': `${FC.Green}遊戲將在 %1 秒後開始。`,
    'hud.buying.subtitle': `${FC.White}<手持羽毛右鍵來打開商店>`,
    'hud.sidebar.map': `地圖: ${FC.Green}%1`,
    'hud.sidebar.players': `人數: ${FC.Green}%1 ${FC.White}(${FC.Aqua}%2${FC.White}/${FC.Red}%3${FC.White})`,
    'hud.sidebar.mode': '模式:',
    'member.join': `${FC.Bold}${FC.Green}%1 加入了房間。`,
    'member.leave': `${FC.Bold}${FC.Red}%1 離開了房間。`,
    'command.join_team': `${FC.MinecoinGold}%1 加入了 [%2]`,

    'shop.title': '商店',
    'shop.body': `選擇要購買的項目:\n你的金錢: ${FC.MinecoinGold}%1$`,
    'prestart.suggest_settings': '建議設定',
    'prestart.camera_shake': `設定->視訊->相機晃動${FC.Green}(開啟)`,
    'prestart.fov_adjust': `設定->視訊->視野可透過遊戲控制調整${FC.Red}(關閉)`,
};

export const zh_TW = {
    ...base_zh_TW,

    'shop.title': '商店',
    'shop.body': `裝備點數：${FC.MinecoinGold}%1/%2\n主武器：${FC.Green}%3\n副武器：${FC.Green}%4\n護甲：${FC.Green}%5\n投擲物：${FC.Green}%6`,
    'shop.remaining_points': '剩餘 %1P',
    'shop.throwable.remove': '移除 %1 x1',
    'shop.throwable.clear': '清空投擲物 (%1/%2)',
    'shop.error.prefix': `${FC.Red}%1。`,
    'shop.error.no_points': '裝備點數不足',
    'shop.error.item_limit_reached': '已達到該裝備上限',
    'shop.error.throwable_total_limit_reached': '已達到投擲物總上限',
    'shop.error.product_not_found': '找不到該商品',
    'shop.error.not_buying': '只能在購買階段開啟商店',
    'shop.loadout.reset': '上一回合配置超出本回合點數上限，已重置部分裝備。',
} as const;
