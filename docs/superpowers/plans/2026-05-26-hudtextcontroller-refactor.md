# HudTextController Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `HudTextController` to manage message durations natively (fire-and-forget) and migrate the Sidebar system to the native Bedrock Scoreboard API with a flicker-free diff algorithm.

**Architecture:** We will implement a pure logic Diff Algorithm for the Scoreboard Sidebar and a tick-based array manager for Subtitle/Actionbar messages. We will modify `ActionHud` and `WaitingHud` to provide global sidebar states instead of per-player.

**Tech Stack:** TypeScript, `@minecraft/server`

---

## Chunk 1: HudTextController Logic

### Task 1: Update HudTextController Interface and Message Queue
Modify `HudTextController` to manage arrays of `HudMessage` objects with an expiration tick.

**Files:**
- Modify: `scripts/modules/hud/HudTextController.ts`

- [ ] **Step 1: Define Interfaces**
Update `scripts/modules/hud/HudTextController.ts` with new interfaces:
```typescript
export interface HudMessage { text: string; expireTick: number; }
```

- [ ] **Step 2: Rewrite Class Structure and Methods**
Modify `_HudTextController` to store queues, Scoreboard state, and handle player leave events:
```typescript
class _HudTextController {
    private static _instance: _HudTextController;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private subtitleQueue = new Map<Player, HudMessage[]>();
    private actionbarQueue = new Map<Player, HudMessage[]>();
    private previousSidebarLines: string[] = [];

    private constructor() {
        system.runInterval(this.update.bind(this));
        world.afterEvents.playerLeave.subscribe((ev) => this.cleanupPlayer(ev.playerName));
    }

    private cleanupPlayer(playerName: string) {
        for (const [player] of this.subtitleQueue) {
            if (player.name === playerName) this.subtitleQueue.delete(player);
        }
        for (const [player] of this.actionbarQueue) {
            if (player.name === playerName) this.actionbarQueue.delete(player);
        }
    }

    pushSubtitle(player: Player, text: string, duration: number) {
        if (!this.subtitleQueue.has(player)) this.subtitleQueue.set(player, []);
        const queue = this.subtitleQueue.get(player)!;
        // Deduplicate: If exactly same text is pushed, just extend its expiration
        const existing = queue.find(m => m.text === text);
        if (existing) existing.expireTick = Math.max(existing.expireTick, system.currentTick + duration);
        else queue.push({ text, expireTick: system.currentTick + duration });
    }

    pushActionbar(player: Player, text: string, duration: number) {
        if (!this.actionbarQueue.has(player)) this.actionbarQueue.set(player, []);
        const queue = this.actionbarQueue.get(player)!;
        // Deduplicate
        const existing = queue.find(m => m.text === text);
        if (existing) existing.expireTick = Math.max(existing.expireTick, system.currentTick + duration);
        else queue.push({ text, expireTick: system.currentTick + duration });
    }
```

- [ ] **Step 3: Update Loop for Queues**
In `update()`, filter out expired messages and display active ones.
```typescript
    private update() {
        // Subtitles & Actionbar
        for (const player of world.getAllPlayers()) {
            this.updatePlayerHud(player, this.subtitleQueue, (text) => {
                try { player.onScreenDisplay.setTitle(" ", { subtitle: text, fadeInDuration: 0, fadeOutDuration: 0, stayDuration: 20 }); } catch {}
            });
            this.updatePlayerHud(player, this.actionbarQueue, (text) => {
                try { player.onScreenDisplay.setActionBar(text); } catch {}
            });
        }
    }

    private updatePlayerHud(player: Player, queue: Map<Player, HudMessage[]>, displayFn: (text: string) => void) {
        if (!queue.has(player)) return;
        const messages = queue.get(player)!;
        const now = system.currentTick;
        const activeMessages = messages.filter(m => m.expireTick > now);
        
        if (activeMessages.length !== messages.length) {
            queue.set(player, activeMessages);
        }
        
        if (activeMessages.length > 0) {
            displayFn(activeMessages.map(m => m.text).join(`\n${FormatCode.Reset}`));
        } else {
            // Optional: call displayFn("") to clear if needed, but Minecraft clears automatically on expire
        }
    }
```

- [ ] **Step 4: Build check**
Run: `npm run build`
Expected: Passes (with unused variable warnings potentially)

- [ ] **Step 5: Commit**
Run: `git add . && git commit -m "feat(hud): implement subtitle and actionbar queue"`

### Task 2: Implement Scoreboard Diff Algorithm
Add the `setSidebar` logic to `HudTextController`.

**Files:**
- Modify: `scripts/modules/hud/HudTextController.ts`

- [ ] **Step 1: Scoreboard Objective Initialization**
Add method to ensure `xblockfire_sidebar` exists:
```typescript
    private getSidebarObjective(): ScoreboardObjective {
        let obj = world.scoreboard.getObjective('xblockfire_sidebar');
        if (!obj) {
            obj = world.scoreboard.addObjective('xblockfire_sidebar', 'XBlockFire');
        }
        return obj;
    }
```

- [ ] **Step 2: Implement Diff Logic**
Add `setSidebar` method.
```typescript
    setSidebar(lines: string[]) {
        // Ensure objective exists and is set to Sidebar slot
        const obj = this.getSidebarObjective();
        try { world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { objective: obj }); } catch {}

        // Handle empty lines uniqueness
        const uniqueLines: string[] = [];
        const spacesCount = new Map<string, number>();
        for (let line of lines) {
            if (line.trim() === '') {
                const count = (spacesCount.get('') || 0) + 1;
                spacesCount.set('', count);
                line = ' '.repeat(count);
            }
            uniqueLines.push(line);
        }

        // Diff algorithm
        const previous = this.previousSidebarLines;
        
        // 1. Remove old lines not in new
        for (const oldLine of previous) {
            if (!uniqueLines.includes(oldLine)) {
                try { obj.removeParticipant(oldLine); } catch {}
            }
        }

        // 2. Set scores for new/existing
        let score = 15;
        for (const line of uniqueLines) {
            try { obj.setScore(line, score); } catch {}
            score--;
        }

        this.previousSidebarLines = uniqueLines;
    }
```

- [ ] **Step 3: Clear old methods**
Remove `appendRaw` and `clear` from `_HudTextController`.

- [ ] **Step 4: Build check**
Run: `npm run build`
Expected: Compile error due to `MessageManager.ts` still using `appendRaw`. (We will fix this in Task 3)

- [ ] **Step 5: Commit**
Run: `git add . && git commit -m "feat(hud): implement scoreboard sidebar diff algorithm"`

## Chunk 2: Subsystem Refactoring

### Task 3: Refactor MessageManager
Update `MessageManager` to use the new `HudTextController` API.

**Files:**
- Modify: `scripts/modules/hud/MessageManager.ts`

- [ ] **Step 1: Update API Signatures**
Modify `rawActionbar` and `rawSubtitle` to accept an optional `duration` (default 60). Remove `sidebar`.
```typescript
    static rawActionbar(message: string | string[], target?: MessageTarget, duration: number = 60) {
        const text = Array.isArray(message) ? message.join('\n') : message;
        for (const p of this.getPlayers(target)) {
            HudTextController.pushActionbar(p, text, duration);
        }
    }

    static rawSubtitle(message: string | string[], target?: MessageTarget, duration: number = 60) {
        const text = Array.isArray(message) ? message.join('\n') : message;
        for (const p of this.getPlayers(target)) {
            HudTextController.pushSubtitle(p, text, duration);
        }
    }
```

- [ ] **Step 2: Remove sidebar**
Remove `sidebar` and `rawSidebar` entirely, as it will be managed globally.

- [ ] **Step 3: Build check**
Run: `npm run build`
Expected: Compile error in `Action.ts` and `Waiting.ts`.

- [ ] **Step 4: Commit**
Run: `git add . && git commit -m "refactor(hud): adapt MessageManager to new HudTextController API"`

### Task 4: Refactor ActionHud and WaitingHud
Adapt the bomb plant phase HUDs to use the global scoreboard and remove per-player logic.

**Files:**
- Modify: `scripts/modules/hud/bomb_plant/Action.ts`
- Modify: `scripts/modules/hud/bomb_plant/Waiting.ts`

- [ ] **Step 1: Update Action.ts**
Remove `for (const player of players)` loop. Use global info.
```typescript
    private updateSidebar() {
        const phase = PhaseManager.getPhase();
        const attackerScore = variable(`attacker_score`);
        const defenderScore = variable(`defender_score`);
        const attackerPlayers = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: true });
        const defenderPlayers = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: true });
        const attackerDeadPlayers = MemberManager.getPlayers({ team: TeamEnum.Attacker, is_alive: false });
        const defenderDeadPlayers = MemberManager.getPlayers({ team: TeamEnum.Defender, is_alive: false });
        const seconds = Number((phase.currentTick / 20).toFixed(0));

        const message = [
            `   ${Msg.translate("hud.sidebar.round", defenderScore + attackerScore + 1)}  `,
            Msg.translate("hud.sidebar.time", Math.floor(seconds / 60), String(seconds % 60).padStart(2, '0')),
            '',
            `${FC.Aqua}D-${defenderScore} ${FC.White}| ${FC.Bold}${FC.Aqua}${'O '.repeat(defenderPlayers.length)}${FC.Gray}${'X '.repeat(defenderDeadPlayers.length)}`,
            `${FC.Red}A-${attackerScore} ${FC.White}| ${FC.Bold}${FC.Red}${'O '.repeat(attackerPlayers.length)}${FC.Gray}${'X '.repeat(attackerDeadPlayers.length)}`
        ];
        HudTextController.setSidebar(message);
    }
```
Update `updateSubtitle` to send only ONCE when phase changes? Wait, `Action.ts` is called every tick. `Buying` subtitle uses `currentTick`, so it changes every tick. We can keep sending it with duration `2` ticks so it overrides smoothly.
```typescript
    private updateSubtitle() {
        const phase = PhaseManager.getPhase();
        let text = '';
        if (phase.phaseTag === BombPlantPhaseEnum.Buying) {
            text = Msg.translate("hud.buying.subtitle", (phase.currentTick / 20).toFixed(0));
        }
        if (text === '') return;
        Msg.rawSubtitle(text, undefined, 2); // 2 ticks duration
    }
```

- [ ] **Step 2: Update Waiting.ts**
Same logic. Make sidebar global.
```typescript
    private updateSidebar() {
        const players = MemberManager.getPlayers();
        const map = MapRegister.getMap(Config.mapId)!;
        const playerCount = players.length;
        const attackers = MemberManager.getPlayers({ team: TeamEnum.Attacker });
        const defenders = MemberManager.getPlayers({ team: TeamEnum.Defender });

        const message = [
            Msg.translate("hud.sidebar.map", map.name),
            Msg.translate("hud.sidebar.players", playerCount, defenders.length, attackers.length),
            '',
            Msg.translate("hud.sidebar.mode"),
            "Bomb Defusal",
            ''
        ];
        HudTextController.setSidebar(message);
    }
```

- [ ] **Step 3: Build check**
Run: `npm run build`
Expected: Compile succeeds with no errors.

- [ ] **Step 4: Commit**
Run: `git add . && git commit -m "refactor(hud): migrate bomb plant huds to global scoreboard sidebar"`
