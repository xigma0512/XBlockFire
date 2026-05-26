import { FormatCode as FC } from "../../utils/FormatCode";

export const zh_TW = {
    "system.name": `${FC.Bold}${FC.Gold}XBlockFire`,
    "system.prefix": `${FC.Gray}>> ${FC.Reset}`,
    "c4.pickup": "你撿起了 C4。",
    "c4.dropped": `${FC.Bold}${FC.Blue}C4 已掉落。`,
    "c4.pickup.broadcast": `${FC.Bold}${FC.Yellow}玩家 %1 撿起了 C4。`,
    "c4.planted.broadcast": `${FC.Bold}${FC.MinecoinGold}C4 已被安裝`,
    "c4.planted.reward": "C4 安裝獎勵: +%1$",
    "c4.defuse.no_range": `${FC.Red}範圍內沒有 C4。`,
    "c4.defused.broadcast": [
        `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ 回合結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Gold}C4 已由 %1 拆除。`,
        `${FC.Bold}${FC.Green}防守方 (DEFENDERS) 贏得了這場比賽。`,
        `${FC.Bold}${FC.Gray}---`
    ],
    "game.assigned.attacker": "你已被分配到 進攻方 (Attacker)。",
    "game.assigned.defender": "你已被分配到 防守方 (Defender)。",
    "game.wait_players": `${FC.Bold}${FC.Red}玩家人數不足，正在等待更多玩家...`,
    "game.switch_side": [
        `${FC.Bold}${FC.White}--- --- ---`,
        `${FC.Bold}${FC.Yellow}- 交換隊伍 -`,
        `${FC.Bold}${FC.White}--- --- ---`
    ],
    "game.player_eliminated": `${FC.Bold}%1 %2 ${FC.DarkRed}淘汰了 %3 %4`,
    "game.killed_you": `${FC.Bold}${FC.Red}%1 擊殺了你`,
    
    // Round End Messages
    "round.end.time_up": [
        "",
        `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ 回合結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Red}進攻方時間耗盡。`,
        `${FC.Bold}${FC.Green}防守方贏得了這一回合。`,
        `${FC.Bold}${FC.Gray}--------------------`,
        ""
    ],
    "round.end.attacker_eliminated": [
        "",
        `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ 回合結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Red}進攻方已全數被殲滅。`,
        `${FC.Bold}${FC.Green}防守方贏得了這一回合。`,
        `${FC.Bold}${FC.Gray}--------------------`,
        ""
    ],
    "round.end.defender_eliminated": [
        "",
        `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ 回合結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Red}防守方已全數被殲滅。`,
        `${FC.Bold}${FC.Green}進攻方贏得了這一回合。`,
        `${FC.Bold}${FC.Gray}--------------------`,
        ""
    ],
    "round.end.c4_detonated": [
        "",
        `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ 回合結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Red}C4 已引爆！`,
        `${FC.Bold}${FC.Green}進攻方贏得了這一回合。`,
        `${FC.Bold}${FC.Gray}--------------------`,
        ""
    ],

    // Game Over Messages
    "game.over.attacker_disconnect": [
        "",
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ 遊戲結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Red}所有進攻方玩家已斷線。`,
        `${FC.Bold}${FC.Yellow}防守方贏得了這場比賽。`,
        `${FC.Bold}${FC.Gray}--------------------`,
        ""
    ],
    "game.over.defender_disconnect": [
        "",
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ 遊戲結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Red}所有防守方玩家已斷線。`,
        `${FC.Bold}${FC.Yellow}進攻方贏得了這場比賽。`,
        `${FC.Bold}${FC.Gray}--------------------`,
        ""
    ],
    "game.over.attacker_win": [
        "",
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ 遊戲結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Yellow}進攻方贏得了這場比賽。`,
        `${FC.Bold}${FC.Gray}--------------------`,
        ""
    ],
    "game.over.defender_win": [
        "",
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ 遊戲結束 ] ${FC.Gray}----`,
        `${FC.Bold}${FC.Yellow}防守方贏得了這場比賽。`,
        `${FC.Bold}${FC.Gray}--------------------`,
        ""
    ],

    "game.scoreboard.header": "--- [ 計分板 ] ---",
    "hud.waiting": `${FC.Yellow}正在等待更多玩家...`,
    "hud.start_in": `${FC.Green}遊戲將在 %1 秒後開始。`,
    "hud.buying.subtitle": [
        `${FC.Yellow}> %1 <`,
        `${FC.White}右鍵點擊羽毛以打開商店。`
    ],
    "hud.sidebar.map": `地圖: ${FC.Green}%1`,
    "hud.sidebar.players": `人數: ${FC.Green}%1 ${FC.White}(${FC.Aqua}%2${FC.White}/${FC.Red}%3${FC.White})`,
    "hud.sidebar.mode": "模式:",
    "hud.sidebar.round": `${FC.Gold}第 %1 回合`,
    "hud.sidebar.time": `剩餘時間: ${FC.Gray}%1:%2`,
    "hud.sidebar.kd": `擊殺/死亡: ${FC.Green}%1/%2`,
    "hud.sidebar.money": `金錢: ${FC.Green}%1`,
    "hud.sidebar.your_team": "你的隊伍:",
    "hud.sidebar.attacker": `${FC.Red}進攻方 (Attacker)`,
    "hud.sidebar.defender": `${FC.Aqua}防守方 (Defender)`,
    "member.join": `${FC.Bold}${FC.Green}%1 加入了房間。`,
    "member.leave": `${FC.Bold}${FC.Red}%1 離開了房間。`,
    "command.join_team": `${FC.MinecoinGold}%1 加入了 [%2]`,
    "economy.round_income": "回合收益: +%1$",
    "kill.reward": "擊殺獎勵: +%1$",
    "shop.title": "商店",
    "shop.body": `選擇要購買的項目:\n你的金錢: ${FC.MinecoinGold}%1$`,
    "shop.refund_tag": `${FC.DarkGreen}(退回)`,
    "shop.error.prefix": `${FC.Red}%1。`,
    "shop.error.need_refund": "你必須先退回你的 %1。",
    "shop.error.limit_reached": "你已達到購買上限。",
    "shop.error.no_money": "你沒有足夠的金錢購買這個。",
    "shop.refund.success": "你退回了 %1。 (+%2$)",
    "shop.buy.success": "你購買了 %1。 (-%2$)",
    "prestart.suggest_settings": "建議設定",
    "prestart.camera_shake": `設定->視訊->相機晃動${FC.Green}(開啟)`,
    "prestart.fov_adjust": `設定->視訊->視野可透過遊戲控制調整${FC.Red}(關閉)`
};
