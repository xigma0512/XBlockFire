# Domain-Based Architecture Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the codebase into a domain-based structure (core, player, combat, world) and update all imports.

**Architecture:** Domain-Driven Design inspired structure to group related functionality and improve discoverability.

**Tech Stack:** TypeScript (Minecraft Bedrock Script API)

---

## Chunk 1: Directory Preparation & Core Domain Migration

### Task 1: Create Directory Structure
**Files:**
- Create: `scripts/core/gamephase/bomb_plant`
- Create: `scripts/core/c4state/states`
- Create: `scripts/player`
- Create: `scripts/combat/weapon`
- Create: `scripts/world`

- [ ] **Step 1: Create directories**
Run: `mkdir -p scripts/core/gamephase/bomb_plant scripts/core/c4state/states scripts/player scripts/combat/weapon scripts/world`

### Task 2: Migrate Core Logic (GameRoom, Economy, Phases, C4)
- [ ] **Step 1: Move GameRoom & Economy**
Run: `mv scripts/modules/gameroom/GameRoom.ts scripts/core/GameRoom.ts`
Run: `mv scripts/modules/gameroom/EconomyManager.ts scripts/core/EconomyManager.ts`
Run: `mv scripts/modules/gameroom/GameModeEnum.ts scripts/core/GameModeEnum.ts`

- [ ] **Step 2: Move Phase Management**
Run: `mv scripts/modules/gamephase/PhaseManager.ts scripts/core/gamephase/PhaseManager.ts`
Run: `mv scripts/modules/gamephase/BlankPhaseHandler.ts scripts/core/gamephase/BlankPhaseHandler.ts`
Run: `mv scripts/modules/gamephase/BombPlantPhaseEnum.ts scripts/core/gamephase/BombPlantPhaseEnum.ts`
Run: `mv scripts/modules/gamephase/IPhaseHandler.d.ts scripts/core/gamephase/IPhaseHandler.d.ts`

- [ ] **Step 3: Move Bomb Plant Phase States**
Move files from both `base` and `modules`.
Run: `mv scripts/base/gamephase/bomb_plant/* scripts/core/gamephase/bomb_plant/`
Run: `mv scripts/modules/gamephase/bomb_plant/* scripts/core/gamephase/bomb_plant/` (Overwrite if exists)

- [ ] **Step 4: Move C4 State Management**
Run: `mv scripts/modules/c4state/C4Manager.ts scripts/core/c4state/C4Manager.ts`
Run: `mv scripts/modules/c4state/C4StateEnum.ts scripts/core/c4state/C4StateEnum.ts`
Run: `mv scripts/modules/c4state/IC4StateHandler.d.ts scripts/core/c4state/IC4StateHandler.d.ts`

- [ ] **Step 5: Move C4 States**
Run: `mv scripts/base/c4state/states/* scripts/core/c4state/states/`
Run: `mv scripts/modules/c4state/states/* scripts/core/c4state/states/` (Overwrite if exists)

---

## Chunk 2: Player, Combat, and World Domain Migration

### Task 3: Migrate Player Domain
- [ ] **Step 1: Move Player Management**
Run: `mv scripts/modules/gameroom/MemberManager.ts scripts/player/MemberManager.ts`
Run: `mv scripts/modules/gameroom/TeamEnum.ts scripts/player/TeamEnum.ts`

- [ ] **Step 2: Move & Rename Player Death Handler**
Run: `mv scripts/modules/playerDead/playerDead.ts scripts/player/PlayerDeathHandler.ts`

- [ ] **Step 3: Move Allies Marker**
Run: `mv scripts/modules/allies_mark/AlliesMarker.ts scripts/player/AlliesMarker.ts`

### Task 4: Migrate Combat Domain
- [ ] **Step 1: Move Weapons**
Run: `mv scripts/modules/weapon/* scripts/combat/weapon/`

- [ ] **Step 2: Move & Rename Item Manager**
Run: `mv scripts/modules/uncommon_items/UnCommonItems.ts scripts/combat/ItemManager.ts`

### Task 5: Migrate World Domain
- [ ] **Step 1: Move Map Logic**
Run: `mv scripts/modules/gamemap/MapRegister.ts scripts/world/MapRegister.ts`
Run: `mv scripts/modules/gamemap/GameMapType.d.ts scripts/world/GameMapType.d.ts`

- [ ] **Step 2: Move & Rename World Setup**
Run: `mv scripts/modules/pre_start/preStart.ts scripts/world/WorldSetup.ts`

---

## Chunk 3: Entry Points, Main Update, and Global Imports

### Task 6: Create Index Files
- [ ] **Step 1: Create `scripts/core/index.ts`**
Content: (Empty)

- [ ] **Step 2: Create `scripts/player/index.ts`**
Content: `import './PlayerDeathHandler';`

- [ ] **Step 3: Create `scripts/combat/index.ts`**
Content:
```typescript
import './weapon/systems/gun/GunFireSystem'
import './weapon/systems/gun/GunReloadSystem'
import './weapon/systems/gun/GunWeight'
import './weapon/systems/bullet/BulletSystem'
import './weapon/systems/grenade/GrenadeSystem'
```

- [ ] **Step 4: Create `scripts/world/index.ts`**
Content: `import './WorldSetup';`

### Task 7: Update `scripts/main.ts`
- [ ] **Step 1: Replace imports in `main.ts`**
New Imports:
```typescript
import './core';
import './player';
import './world';
import './combat';
import './command/CommandRegistry';
import './ui/shop/Shop';
import './ui/hud/huds/WeaponInfo';
import './test';
```

### Task 8: Global Import Update
- [ ] **Step 1: Run comprehensive search and replace for imports**
This involves updating:
- `scripts/modules/` -> `scripts/core/`, `scripts/player/`, `scripts/combat/`, `scripts/world/`
- `scripts/base/` -> `scripts/core/`
- Relative paths `../../modules/` etc.

### Task 9: Cleanup
- [ ] **Step 1: Delete temporary/empty directories**
Run: `rm scripts/modules/__entry__.ts`
Run: `rm -rf scripts/modules scripts/base` (After verifying all files are moved)

- [ ] **Step 2: Final build check**
Run: `npm run build` (or equivalent)
