# Economy Rework Design

## Goal

Replace the current money-based economy with a fair round-based equipment point system. Every player has the same equipment point limit in the same round, regardless of team, kills, deaths, bomb plants, or previous round results. The system should reduce player learning cost, remove forced eco rounds, and keep equipment choices meaningful through point trade-offs.

## Scope

This design covers the BombPlant economy and shop rework:

- Round equipment point limits.
- Player loadout state.
- Multi-tab shop UI.
- Point-based product catalog.
- Throwable item limits.
- Hidden armor tiers and damage reduction.
- Removal of money rewards from round outcomes, kills, and bomb plants.

This design does not cover Deathmatch mode or broader weapon balance beyond first-pass point costs.

## Round Points

Equipment points are derived from the total match round number, not player performance.

| Match Round | Point Limit |
| --- | --- |
| 1 | 2 |
| 2 | 3 |
| 3 | 4 |
| 4 | 5 |
| 5 | 5 |
| 6 | 6 |
| 7 | 6 |
| 8+ | 8 |

The round number is calculated from `attacker_score + defender_score + 1`. Side switching does not reset the point curve.

## Core Modules

### `EquipmentPointManager`

Responsibilities:

- Return the point limit for the current match round.
- Own the point curve table.
- Provide a small API for callers that need current round points.

This manager does not store per-player balances. Since the economy is fair by design, every eligible player shares the same round limit.

### `LoadoutManager`

Responsibilities:

- Store each player's selected loadout.
- Initialize default loadouts.
- Calculate used points.
- Validate point limits.
- Validate category and item limits.
- Apply successful loadout changes immediately to hotbar state.
- Track hidden armor tier for damage reduction.
- Reset or sanitize loadouts when needed.

Required operations:

- `initializePlayer(player)`
- `removePlayer(player)`
- `getLoadout(player)`
- `getUsedPoints(player)`
- `getAvailablePoints(player)`
- `setPrimary(player, productId)`
- `setSecondary(player, productId)`
- `setArmor(player, armorTier)`
- `addThrowable(player, productId)`
- `removeThrowable(player, productId)`
- `clearThrowables(player)`
- `sanitizeForCurrentRound(player)`
- `getArmorReduction(player)`

Default loadout:

- No primary weapon.
- `Glock17` secondary.
- No throwables.
- Hidden armor tier `none`.

### `ShopCatalog`

Responsibilities:

- Define shop categories.
- Define point costs.
- Define hotbar slots and item actors.
- Define throwable per-item maximums.
- Define throwable category total maximum.
- Define armor tiers and point costs.

Initial point costs:

| Item | Category | Cost | Limit |
| --- | --- | --- | --- |
| Glock17 | Secondary | 0 | 1 |
| Deagle | Secondary | 2 | 1 |
| P90 | Primary | 3 | 1 |
| SG200 | Primary | 3 | 1 |
| AK47 | Primary | 4 | 1 |
| M4A4 | Primary | 4 | 1 |
| AWP | Primary | 6 | 1 |
| Smoke | Throwable | 1 | 1 |
| Flashbang | Throwable | 1 | 2 |
| Light Armor | Armor | 2 | 1 |
| Heavy Armor | Armor | 4 | 1 |
| No Armor | Armor | 0 | 1 |

Throwable category total limit: 4.

The catalog should be data-driven enough to add future throwables such as HE grenades with their own per-item limit while still respecting the category total limit.

### `TabbedActionForm`

Responsibilities:

- Provide a reusable TypeScript wrapper around `ActionFormData`.
- Support named tabs/categories.
- Support tab switching without exposing marker text to shop code.
- Return button metadata for selected action buttons.
- Optionally support the special icon/enchanted rendering technique from `scripts/ui_test/customForm.js`.

This module should not contain shop-specific rules.

### `Shop`

Responsibilities:

- Render the point shop.
- Open the default tab or reopen the current tab.
- Display current points and loadout summary.
- Convert selected UI actions into `LoadoutManager` calls.
- Show errors without mutating loadout state.

`Shop` should stay thin. Point calculation, limits, and item application belong in `LoadoutManager` and `ShopCatalog`.

## Shop UI

The shop uses four tabs:

- Primary
- Secondary
- Throwables
- Armor

The form body displays:

- Used points and current point limit.
- Current primary weapon.
- Current secondary weapon.
- Current hidden armor tier.
- Current throwable counts.

### Primary Tab

Shows:

- AK47
- M4A4
- SG200
- P90
- AWP

Selecting an item replaces the current primary weapon if the resulting loadout is legal.

### Secondary Tab

Shows:

- Glock17
- Deagle

Selecting an item replaces the current secondary weapon. Glock17 is the 0-point default and can be used as a reset option.

### Throwables Tab

Shows throwable products and removal controls.

Product buttons:

- Add one item when selected.
- Show current count, for example `Flashbang x1/2`.
- Fail without changing state if the player lacks points, hits the item limit, or hits the throwable category limit.

Removal controls:

- Show `Remove <item> x1` for each throwable currently held.
- Show `Clear Throwables` when at least one throwable is held.
- Removing or clearing throwables immediately frees points and updates hotbar state.

### Armor Tab

Shows:

- No Armor
- Light Armor
- Heavy Armor

Selecting an armor option replaces the hidden armor tier if the resulting loadout is legal.

## Armor Model

Visual armor and gameplay armor are separate.

Visual armor:

- Still assigned by team at round start.
- Keeps the current attacker/defender color identity.
- Does not reveal purchased armor tier to opponents.

Gameplay armor:

- Stored internally in `LoadoutManager`.
- Does not change visible equipment.
- Applies global bullet damage reduction.

Initial armor reductions:

| Armor Tier | Reduction |
| --- | --- |
| None | 0% |
| Light | 15% |
| Heavy | 30% |

Reduction applies to all bullet damage, regardless of hit part. After reduction, damage should be rounded with `Math.ceil()` before applying health changes.

The reduction should be applied inside `DamageSystem.applyBulletDamage()` after raw weapon damage is selected and before health is reduced.

## Round Flow

### Game Start

For each active player:

- Initialize loadout.
- Send the default hotbar.

### Pre-Round Start

For each active player:

- Keep existing team visual armor behavior.
- Clear inventory and reset round state as today.
- Apply C4 and defuser assignments as today.
- Sanitize the saved loadout against the current round point limit.
- Apply the sanitized loadout to the hotbar.

If a saved loadout exceeds the current point limit, use a deterministic reset:

- Remove primary weapon.
- Clear throwables.
- Set hidden armor to `none`.
- Keep the secondary weapon if legal; otherwise use Glock17.

When this happens, notify the player that the previous loadout exceeded the current round limit and was partially reset.

### Buying Phase

Players may open the shop with the existing shop item during Buying phase.

All successful selections apply immediately and reopen the same tab. Failed selections show an error and reopen the same tab without changing state.

### Round End

Do not grant economy rewards for:

- Winning the round.
- Losing the round.
- Player kills.
- Bomb plants.

Side switching should not reset equipment points or player loadout preferences.

## Error Handling

The following errors should be explicit and non-mutating:

- Not enough equipment points.
- Item limit reached.
- Throwable total limit reached.
- Shop opened outside Buying phase.
- Product not found or unsupported action.

The UI should remain on the current tab after errors.

## Migration Notes

Existing money-based APIs should be removed or renamed as part of implementation:

- `EconomyManager`
- `ProductTable.price`
- Money text in `zh_TW` language keys.
- Round income in `RoundEnd`.
- Kill reward in `PlayerDeathHandler`.
- Bomb plant reward in `C4PlantedState`.
- Side switch money reset.

`ProductTable` can be replaced by `ShopCatalog` or migrated in place if that reduces churn, but the resulting data model should use point-system names such as `pointCost`.

## Testing

At minimum, implementation should verify:

- Point curve returns expected limits for rounds 1 through 9.
- Used point calculation matches selected loadout.
- Primary, secondary, and armor replacement update used points correctly.
- Throwable per-item limits are enforced.
- Throwable total limit is enforced.
- Failed purchases do not mutate loadout state.
- Armor damage reduction applies globally to bullet damage.
- Money rewards no longer affect economy state.

If the repo has no suitable test harness for these modules, validation should at least include TypeScript compilation and focused manual checks through the build output.
