import { FormatCode as FC } from "../../declarations/enum/FormatCode"

export default {
    // game
    'game.broadcast.gamestart': `${FC.Gray}- ${FC.Yellow}遊戲開始`,
    'game.broadcast.player_select_team': `${FC.Gold}%a 加入 [%b]`,

    'game.shop.refund.success': `${FC.Gray}>> ${FC.Yellow}你退貨了 %a. ${FC.Green}(+%b$)`,
    'game.shop.purchase.success': `${FC.Gray}>> ${FC.Yellow}你購買了 %a. ${FC.Red}(-%b$)`,
    'game.shop.purchase.fail.should_refund_first': `${FC.Gray}>> ${FC.Red}你必須先將你的 %a 退貨才能購買新的商品.`,
    'game.shop.purchase.fail.reached_purchase_limit': `${FC.Gray}>> ${FC.Red}已到達購買上限`,
    'game.shop.purchase.fail.cannot_afford': `${FC.Gray}>> ${FC.Red}你無法負擔這筆交易金額`,

    'game.bombplant.idle.random_assigned_attacker': `${FC.Gray}>> ${FC.Yellow}你被隨機分發到了 Attacker 隊伍`,
    'game.bombplant.idle.random_assigned_defender': `${FC.Gray}>> ${FC.Yellow}你被隨機分發到了 Defender 隊伍`,
    
    'game.bombplant.action.time_up': [
        `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ 回合結束 ] ${FC.Gray}----\n`,
        `${FC.Bold}${FC.Red}回合時間結束，防守方獲勝\n`,
        `${FC.Bold}${FC.Gray}--------------------\n`
    ],
    'game.bombplant.action.attacker_eliminated': [
        `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ 回合結束 ] ${FC.Gray}----\n`,
        `${FC.Bold}${FC.Red}進攻方全部陣亡，防守方獲勝\n`,
        `${FC.Bold}${FC.Gray}--------------------\n`
    ],
    'game.bombplant.action.attacker_disconnect': [
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ GAME OVER ] ${FC.Gray}----\n`,
        `${FC.Bold}${FC.Red}進攻方隊伍人數歸零，遊戲強制結束。\n`,
        `${FC.Bold}${FC.Green}防守方獲勝。\n`,
        `${FC.Bold}${FC.Gray}--------------------\n`
    ],
    'game.bombplant.action.defender_eliminated': [
        `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ 回合結束 ] ${FC.Gray}----\n`,
        `${FC.Bold}${FC.Red}防守方全部陣亡，進攻方獲勝\n`,
        `${FC.Bold}${FC.Gray}--------------------\n`
    ],
    'game.bombplant.action.defender_disconnect': [
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ GAME OVER ] ${FC.Gray}----\n`,
        `${FC.Bold}${FC.Red}防守方隊伍人數歸零，遊戲強制結束。\n`,
        `${FC.Bold}${FC.Green}進攻方獲勝。\n`,
        `${FC.Bold}${FC.Gray}--------------------\n`
    ],

    'game.bombplant.c4planted.time_up': [
        `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ 回合結束 ] ${FC.Gray}----\n`,
        `${FC.Bold}${FC.Red}回合時間結束，防守方獲勝\n`,
        `${FC.Bold}${FC.Gray}--------------------\n`
    ],
    'game.bombplant.c4planted.defender_eliminated': [
        `${FC.Bold}${FC.Gray}---- ${FC.Yellow}[ 回合結束 ] ${FC.Gray}----\n`,
        `${FC.Bold}${FC.Red}防守方全部陣亡，進攻方獲勝\n`,
        `${FC.Bold}${FC.Gray}--------------------\n`
    ],
    'game.bombplant.c4planted.defender_disconnect': [
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ GAME OVER ] ${FC.Gray}----\n`,
        `${FC.Bold}${FC.Red}防守方隊伍人數歸零，遊戲強制結束。\n`,
        `${FC.Bold}${FC.Green}進攻方獲勝。\n`,
        `${FC.Bold}${FC.Gray}--------------------\n`
    ],

    'game.bombplant.roundend.switch_side': [
        `${FC.Bold}${FC.White}--- --- ---\n`,
        `${FC.Bold}${FC.Yellow}- Switch Side -\n`,
        `${FC.Bold}${FC.White}--- --- ---\n`,
    ],
    'game.bombplant.roundend.round_income': `${FC.Gray}>> ${FC.DarkGray}Round Income: +%a`,

    'game.bombplant.gameover.attacker_win': [
        '\n',
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ GAME OVER ] ${FC.Gray}----\n`,
        `${FC.Bold}${FC.Yellow}攻擊方獲勝\n`,
        `${FC.Bold}${FC.Gray}--------------------`,
        '\n'
    ],
    'game.bombplant.gameover.defender_win': [
        '\n',
        `${FC.Bold}${FC.Gray}---- ${FC.DarkPurple}[ GAME OVER ] ${FC.Gray}----\n`,
        `${FC.Bold}${FC.Yellow}防守方獲勝\n`,
        `${FC.Bold}${FC.Gray}--------------------`,
        '\n'
    ],

    'game.scoreboard.title': `--- [ Scoreboard ] ---\n`,
    'game.scoreboard.format': `%a | K:%b D:$c\n`,
    

    // player
    'player.recommand_setting.1': `${FC.Gray}>> ${FC.Yellow}建議設定`,
    'player.recommand_setting.2': `${FC.Gray}>> ${FC.White}設定->視訊->相機晃動${FC.Green}(開啟)`,
    'player.recommand_setting.3': `${FC.Gray}>> ${FC.White}設定->視訊->視野可透過遊戲控制調整${FC.Red}(關閉)`,
    
    // combat
    'combat.player.kill_reward': `${FC.Gray}>> 擊殺獎勵: +200$`,
    'combat.player.killer.subtitle': `${FC.Bold}\uE109${FC.DarkRed}%a`,
    'combat.player.dead_player.subtitle': `${FC.Bold}${FC.Red}你被 %a 殺死了`,
    'combat.broadcast.eliminated': `${FC.Bold}%a ${FC.DarkRed}擊殺了 %b`,

    // hud
    'hud.bombplant.waiting.waiting_for_players.subtitle': `${FC.Yellow}正在等待其他玩家加入...`,
    'hud.bombplant.waiting.count_down.subtitle': `${FC.Green}遊戲將在 %a 秒後開始`,
    'hud.bombplant.waiting.not_enough_player': `${FC.Gray}- ${FC.Bold}${FC.Red}玩家數量不足，重新等待玩家加入`,

    'hud.bombplant.action.buying_message.subtitle.1': `> %a <`,
    'hud.bombplant.action.buying_message.subtitle.2': `手持背包中的羽毛點擊右鍵來開啟商店`,

    // ui
    'ui.shop.title': '商店',
    'ui.shop.body': `選擇你想購買的物品:\n你的錢: ${FC.MinecoinGold}%a`,
    'ui.shop.refund_text': `${FC.DarkGreen}(退貨)`,
    'ui.shop.product_info': `${FC.Reset}%a ${FC.Yellow}%b$\n${FC.DarkGray}%c`,

    // command
    'command.forcestart.success': `${FC.Gray}>> ${FC.LightPurple}強制開始遊戲`,

    'command.set_gamemode.success': `${FC.Gray}>> ${FC.Yellow}設定遊戲模式為 ${FC.Green}%a`,
    'command.set_gamemode.fail.unknown_gamemode': `${FC.Gray}>> ${FC.Red}未知的遊戲模式`,

    'command.set_map.success': `${FC.Gray}>> ${FC.Yellow}設定遊戲地圖為 ${FC.Green}%a`,
    'command.set_map.fail.unknown_map': `${FC.Gray}>> ${FC.Red}未知的地圖編號: %a`,

    'command.select_team.success': `${FC.Gray}>> ${FC.Green}成功加入 [%a]`,
    'command.select_team.fail.wrong_executer': `${FC.Gray}>> ${FC.Red}請用玩家身分執行指令`,
    'command.select_team.fail.unknown_team': `${FC.Gray}>> ${FC.Red}未知的隊伍名稱: %a`,

    'command.admin_select_team.success': `${FC.Gray}>> ${FC.Green}完成`,
}