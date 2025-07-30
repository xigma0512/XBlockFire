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

    // recommand setting
    'player.recommand_setting.1': `${FC.Gray}>> ${FC.Yellow}建議設定`,
    'player.recommand_setting.2': `${FC.Gray}>> ${FC.White}設定->視訊->相機晃動${FC.Green}(開啟)`,
    'player.recommand_setting.3': `${FC.Gray}>> ${FC.White}設定->視訊->視野可透過遊戲控制調整${FC.Red}(關閉)`,

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