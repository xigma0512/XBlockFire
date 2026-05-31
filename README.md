<div align='center'>
  <a href="https://github.com/xigma0512/XBlockFire">
    <img src="images/logo.png" alt="logo" width="250" height="250">
  </a>
</div>

<br />
<div align="center">
<h1 align="center">XBlockFire</h1>

  <p align="center">
    一款基於 Minecraft Bedrock Edition 所打造的第一人稱射擊（FPS）遊戲。
    <br />
    <a href="https://github.com/xigma0512/XBlockFire/issues/new?labels=bug&template=bug-report---.md">回報錯誤</a>
    &middot;
    <a href="https://github.com/xigma0512/XBlockFire/issues/new?labels=enhancement&template=feature-request---.md">功能請求</a>
    <br />
    <a href="/.github/README.en.md">Readme English Version</a>
  </p>
</div>



## 簡介

**XBlockFire** 是一個開源專案，旨在將第一人稱射擊遊戲帶入 Minecraft Bedrock Edition 的世界。目前已成功實現了經典的 **BombPlant (爆破模式)**，並規劃在未來加入更多的遊戲模式。

### 專案核心特色

* **多模式遊戲框架：** 雖然目前以 **BombPlant (爆破模式)** 為核心，但專案設計時已考慮到未來擴展性，能輕鬆整合其他遊戲模式。
    * **BombPlant 模式實作：** 完整實現了攻擊方與防守方的對抗機制，包含回合制、C4 安裝與拆除、經濟系統等核心要素。
* **武器與道具系統：** 實作了多款經典槍械與投擲物，具有獨特的射速、傷害與後座力表現。
* **經濟與商店系統：** 玩家可透過對局獲得經濟，並在購買階段透過自訂 UI 商店購買裝備。
* **高度可設定性：** 專案提供了詳細的設定檔，允許使用者調整遊戲各階段的時間（如準備、購買、行動階段），以及回合獎勵、獲勝分數等遊戲參數。
* **彈性的地圖配置：** 透過 `game_maps.ts` 檔案，使用者可以輕鬆定義和新增自訂地圖，包括設定各隊伍的重生點。

## 開始使用

### 遊玩

經過測試能夠穩定運作的版本會打包成 **`.mcaddon` 檔案** 並發佈在 [Releases](https://github.com/xigma0512/XBlockFire/releases)。

本附加包已在特定 Minecraft Bedrock Edition 版本上進行測試。請確保你的遊戲版本與 [Releases](https://github.com/xigma0512/XBlockFire/releases) 中標註的推薦版本相符，以確保最佳的遊戲體驗。

### 設定

你可以透過修改設定來客製化你的世界。

* **設定 BombPlant 模式中的時間等設定**

    ```typescript
    // scripts/settings/config.ts
    export const bombplant = {
        idle: {
            COUNTDOWN_TIME: 30 * 20     // 準備階段倒數
        },
        buying: {
            COUNTDOWN_TIME: 20 * 20     // 購買階段倒數
        },
        action: {
            ACTION_TIME: 120 * 20       // 行動階段時間
        },
        C4planted: {
            COUNTDOWN_TIME: 50 * 20     // 炸彈引爆倒數
        },
        roundEnd: {
            INCOME: [3500, 2200],       // 回合獎勵 [勝利, 失敗]
            WINNING_SCORE: 13,          // 獲勝所需回合
            COUNTDOWN_TIME: 10 * 20     // 回合結束等待
        },
        gameover: {
            COUNTDOWN_TIME: 10 * 20     // 遊戲結束等待
        }
    }
    ```

    **時間單位說明：** 在所有時間設定中，單位為 **遊戲刻 (tick)**。1 秒等於 20 遊戲刻，因此若要設定 30 秒，則數值為 `30 * 20`。目前 `C4planted` 階段的倒數時間暫不支持修改，這是為了確保遊戲平衡性或技術上的限制。未來版本可能會考慮開放此項設定。

* **設定 GameMap 來自訂你的地圖**

    ```typescript
    // scripts/settings/game_maps.ts
    export default {
        0: {
            id: 0,
            name: 'Melon Map',
            description: 'A Good Map',
            positions: {
                spawns: {
                    'Attacker': [
                        { x: 130.5, y: 86, z: 28.5 },
                        { x: 130.5, y: 86, z: 26.5 },
                        { x: 130.5, y: 86, z: 24.5 },
                        { x: 128.5, y: 86, z: 27.5 },
                        { x: 128.5, y: 86, z: 25.5 }
                    ],
                    'Defender': [
                        { x: 178.5, y: 86, z: -15.5 },
                        { x: 178.5, y: 86, z: -13.5 },
                        { x: 178.5, y: 86, z: -11.5 },
                        { x: 180.5, y: 86, z: -14.5 },
                        { x: 180.5, y: 86, z: -12.5 }
                    ],
                    'Spectator': [
                        { x: 178.5, y: 86, z: -15.5 }
                    ],
                }
            }
        }
    } as Record<number, GameMapType>;
    ```

    **獲取遊戲內座標：** 你可以在遊戲中使用 `/tp ~ ~ ~` 或開啟座標顯示（設定 -> 遊戲 -> 顯示座標）來獲取當前位置的精確 X、Y、Z 座標，以便於設定重生點。

    **C4 安裝區域設定：** 目前 C4 的可安裝區域並非透過設定檔定義，而是透過在地圖中放置 **紅石塊 (`minecraft:redstone_block`)** 來標記。玩家只需站在紅石塊上方（或紅石塊位於地面下方的對應位置）即可開始安裝 C4。

    **新增自訂地圖：** 若要新增更多自訂地圖，只需在 `game_maps.ts` 檔案中，依照現有地圖 `0` 的格式，新增一個新的地圖 ID 和其對應的設定即可。確保每個地圖 ID 都是獨一無二的。



## 未來規劃

我們正致力於不斷完善 XBlockFire，以下是目前規劃中的功能：

* **死鬥模式 (Deathmatch Mode)：** 實作更快速、節奏更強的對抗模式，支持快速重生與自由選槍。
* **全新經濟系統：** 引入「裝備點數制 (Point-Based System)」，簡化傳統經濟規則，讓玩家更專注於槍法與戰術。
* **更多地圖適配：** 加入更多經典地圖的移植與原創地圖支持。



## 授權

本專案採用 Apache-2.0 授權條款。更多資訊請參閱 [LICENSE](https://github.com/xigma0512/XBlockFire/blob/master/LICENSE)。



## 貢獻

### 如何貢獻？

* **回報問題或建議功能 (Issues & Feature Requests)**：如果您發現任何錯誤、有疑問或對專案有新功能建議，請隨時在我們的 [Issue](https://github.com/xigma0512/XBlockFire/issues/new) 頁面開啟一個議題。

* **提供技術支援**：
    * 動畫：包括換彈、射擊、切換武器等。
    * 模型：高品質的 3D 槍械模型。
    * 音效：射擊、換彈、槍機復位/滑套鎖定等音效。
    * 其他：任何其他技術協助。

如果您能提供相關資源，或知道哪裡可以找到高品質的免費/開源資源，請[聯繫我們](#聯繫)。


## 聯繫

**Discord**: @xigma0512

**Discord 社群**: https://discord.gg/6d98pFWhgY

**專案連結**: https://github.com/xigma0512/XBlockFire