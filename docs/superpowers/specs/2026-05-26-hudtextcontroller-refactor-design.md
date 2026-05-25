# HudTextController Refactor Design

## 1. Overview
The goal of this refactoring is to redesign the `HudTextController` in XBlockFire to properly manage message durations natively and to migrate the Sidebar system from the `setTitle`-based hack to the native Bedrock Scoreboard API. The new design addresses flickering issues with Scoreboards and supports message stacking for `subtitle` and `actionbar` elements.

## 2. Architecture & Components

### 2.1 Scoreboard Sidebar Manager (Global)
- **Responsibility**: Manages the native Bedrock Scoreboard Sidebar (`DisplaySlotId.Sidebar`).
- **Mechanism**: The Sidebar is global. It accepts an array of strings representing lines.
- **Diff Algorithm (Flicker Prevention)**: 
  - Minecraft Bedrock identifies scoreboard entries by their string content.
  - The controller will cache the previous frame's lines.
  - On update, it calculates the difference:
    - Removes strings that are no longer present (`removeParticipant`).
    - Adds new strings with a descending score (e.g., 15 for line 1, 14 for line 2) to maintain order.
  - **Duplicate Handling**: Empty lines or duplicate text will automatically have invisible whitespace (`" "`) appended to ensure uniqueness across the Scoreboard.

### 2.2 Subtitle & Actionbar Manager (Per-Player, Fire-and-forget)
- **Responsibility**: Manages short-lived messages like kill feeds, reload progress, and phase announcements.
- **Mechanism**: Supports stacking and independent lifecycles.
- **Data Structure**: Maintains an array of `HudMessage` objects per player, per type (`subtitle`, `actionbar`), where `HudMessage` contains `{ text: string, expireTick: number }`.
- **Flow**:
  1. Subsystems push messages with a duration (e.g., `pushSubtitle(player, text, durationInTicks)`).
  2. The `HudTextController` interval (tick loop) filters out expired messages.
  3. Active messages are joined by `\n` and sent to the native `setTitle` / `setActionBar` APIs.
  4. The native APIs are called dynamically to ensure the stack updates precisely when a message expires or is added.

## 3. Data Flow
1. **Subsystems (e.g., `ActionHud`, `MessageManager`)**:
   - Stop sending HUD updates every tick for transient messages.
   - For Sidebar: Generate the global scoreboard lines once per tick (or when state changes) and call `HudTextController.setSidebar(lines)`. Personal info (Money, KD) is temporarily removed from the global sidebar.
   - For Subtitles/Actionbar: Call `HudTextController.pushSubtitle(player, text, duration)` or `pushActionbar` on demand (e.g., upon a kill event or reload start).
2. **HudTextController**:
   - Tick loop updates global Scoreboard Sidebar based on cached state Diff.
   - Tick loop cleans up expired `subtitle`/`actionbar` messages and dynamically flushes updated joined strings to the player screen.

## 4. Error Handling
- Invalid or unregistered players calling the HUD APIs will be safely ignored via `try-catch` blocks and validation checks against `world.getAllPlayers()`.
- Scoreboard initialization handles cases where the Objective might already exist to prevent crashes.

## 5. Testing
- Verify Sidebar lines reorder correctly without flickering.
- Verify multiple rapid Subtitle/Actionbar messages stack vertically (separated by `\n`) and disappear independently as their individual durations expire.
- Verify personal information correctly removed from Sidebar.
