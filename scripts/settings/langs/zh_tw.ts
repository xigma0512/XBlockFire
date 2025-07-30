import { FormatCode as FC } from "../../declarations/enum/FormatCode"

export default {
    // game
    'game.broadcast.gamestart': `${FC.Gray}- ${FC.Yellow}遊戲開始`,
    'game.broadcast.player_select_team': `${FC.Gold}%a 加入 [%b]`,

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