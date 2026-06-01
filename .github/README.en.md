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


## Getting Started

### Playing

Versions tested for stable operation will be packaged as **`.mcaddon` files** and published on the [Releases](https://github.com/xigma0512/XBlockFire/releases).

This add-on has been tested on specific Minecraft Bedrock Edition versions. Please ensure your game version matches the recommended version indicated on the [Releases](https://github.com/xigma0512/XBlockFire/releases) for the best gaming experience.

### Configuration

You can customize your world by modifying the settings.

* **Configure settings**

    ```typescript
    // scripts/settings/config.ts
    export namespace Config {
        export const game = {
            AUTO_START_MIN_PLAYER: 10,
            LANGUAGE: 'zh_TW',
            DEBUG: true
        }

        export const economy = {
            LIMIT: 9000
        }

        export const uncommon_items = {
            CONTAINER_LOCATION: { x: 155, y: 123, z: -2 },
            ITEM_LIST: {
                'defender_helmet': 0,
                'defender_chestplate': 1,
                'defender_leggings': 2,
                'defender_boots': 3,

                'attacker_helmet': 4,
                'attacker_chestplate': 5,
                'attacker_leggings': 6,
                'attacker_boots': 7,
            }
        }
    }
    ```

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

    **C4 Planting Zone Setup:** Currently, C4 planting zones are not defined via the configuration file. Instead, they are marked by placing **Redstone Blocks (`minecraft:redstone_block`)** in the map. Players simply need to stand on a redstone block (or where a redstone block is located directly beneath the floor) to begin planting the C4.

    **Adding Custom Maps:** To add more custom maps, simply add a new map ID and its corresponding settings in the `game_maps.ts` file, following the format of existing map `0`. Ensure each map ID is unique.

### Commands
* General Players
    * `/forcestart` - Force start the game.
    * `/select_team <TEAM>` - Select a team (Attacker/Defender/Spectator).
* Admins
    * `/admin.select_team <PLAYER> <TEAM>` - Assign a player to a team.
    * `/setting.gamemap <MAP_ID>` - Set the game map.
    * `/setting.gamemode <MODE_NAME>` - Set the game mode.


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