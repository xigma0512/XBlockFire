<div align='center'>
  <a href="https://github.com/xigma0512/XBlockFire">
    <img src="../images/logo.png" alt="logo" width="250" height="250">
  </a>
</div>

<br />
<div align="center">
<h1 align="center">XBlockFire</h1>

  <p align="center">
    A First-Person Shooter (FPS) game built on Minecraft Bedrock Edition.
    <br />
    <a href="https://github.com/xigma0512/XBlockFire/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/xigma0512/XBlockFire/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
    <br />
    <a href="../README.md">中文版說明文件</a>
  </p>
</div>



## Introduction

**XBlockFire** is an open-source project aiming to bring First-Person Shooter gameplay into the world of Minecraft Bedrock Edition. It has successfully implemented the classic **BombPlant mode**, with plans to incorporate more game modes in the future.

### Project Core Features

* **Multi-Mode Game Framework:** While currently centered around **BombPlant mode**, the project is designed with future expandability in mind, allowing for easy integration of other game modes.
    * **BombPlant Mode Implementation:** Fully realizes the core mechanics of attacker vs. defender confrontations, including round-based gameplay, C4 planting and defusing, and an economic system.
* **Weapon & Item System:** Implemented various classic firearms and throwables with unique fire rates, damage, and recoil profiles.
* **Economy & Shop System:** Players earn money through gameplay and can purchase equipment via a custom UI shop during the buying phase.
* **Highly Customizable:** The project provides detailed configuration files, allowing users to adjust game phase durations (e.g., preparation, buying, action phases), as well as round rewards, winning scores, and other game parameters.
* **Flexible Map Configuration:** Easily define and add custom maps through the `game_maps.ts` file, including setting spawn points for each team.



## Getting Started

### Playing

Versions tested for stable operation will be packaged as **`.mcaddon` files** and published on the [Releases](https://github.com/xigma0512/XBlockFire/releases).

This add-on has been tested on specific Minecraft Bedrock Edition versions. Please ensure your game version matches the recommended version indicated on the [Releases](https://github.com/xigma0512/XBlockFire/releases) for the best gaming experience.

### Configuration

You can customize your world by modifying the settings.

* **Configure time settings and more in BombPlant mode**

    ```typescript
    // scripts/settings/config.ts
    export const bombplant = {
        idle: {
            COUNTDOWN_TIME: 30 * 20     // Preparation phase countdown
        },
        buying: {
            COUNTDOWN_TIME: 20 * 20     // Buying phase countdown
        },
        action: {
            ACTION_TIME: 120 * 20       // Action phase duration
        },
        C4planted: {
            COUNTDOWN_TIME: 50 * 20     // C4 explosion countdown
        },
        roundEnd: {
            INCOME: [3500, 2200],       // Round rewards [Winner, Loser]
            WINNING_SCORE: 13,          // Rounds required to win
            COUNTDOWN_TIME: 10 * 20     // Round end wait time
        },
        gameover: {
            COUNTDOWN_TIME: 10 * 20     // Game over wait time
        }
    }
    ```

    **Time Unit Explanation:** In all time settings, the unit is **game ticks**. 1 second equals 20 game ticks, so to set 30 seconds, the value would be `30 * 20`. Currently, the countdown time for the `C4planted` phase is not supported for modification. This is to ensure game balance or due to technical limitations. Future versions may consider opening up this setting.

* **Configure GameMap to customize your maps**

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

    **Getting In-Game Coordinates:** You can use `/tp ~ ~ ~` in-game or enable coordinate display (Settings -> Game -> Show Coordinates) to get the precise X, Y, Z coordinates of your current location, which is useful for setting spawn points.

    **C4 Planting Zone Setup:** Currently, C4 planting zones are not defined via the configuration file. Instead, they are marked by placing **Redstone Blocks (`minecraft:redstone_block`)** in the map. Players simply need to stand on a redstone block (or where a redstone block is located directly beneath the floor) to begin planting the C4.

    **Adding Custom Maps:** To add more custom maps, simply add a new map ID and its corresponding settings in the `game_maps.ts` file, following the format of existing map `0`. Ensure each map ID is unique.



## Future Roadmap

We are committed to continuously improving XBlockFire. Here are some of the features currently in our roadmap:

* **Deathmatch Mode:** Implementing a faster-paced confrontation mode with instant respawns and free weapon selection.
* **New Economy System:** Introducing a "Point-Based System" to simplify traditional economic rules, allowing players to focus more on marksmanship and tactics.
* **More Map Adaptations:** Porting more classic maps and supporting original map designs.



## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](https://github.com/xigma0512/XBlockFire/blob/master/LICENSE) file for more details.



## Contributing

### How to Contribute?

* **Report Issues or Suggest Features (Issues & Feature Requests)**: If you find any bugs, have questions, or have new feature suggestions for the project, feel free to open an issue on our [Issue](https://github.com/xigma0512/XBlockFire/issues/new) page.

* **Provide Technical Support**:
    * Animations: Including reloading, shooting, weapon switching, etc.
    * Models: High-quality 3D gun models.
    * Sound Effects: Shooting, reloading, bolt/slide release sounds, etc.
    * Other: Any other technical assistance.

If you can provide relevant resources or know where to find high-quality free/open-source resources, please [contact us](#contact).


## Contact

**Discord**: @xigma0512

**Discord Community**: https://discord.gg/6d98pFWhgY

**Project Link**: https://github.com/xigma0512/XBlockFire