[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stars][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Apache-2.0][license-shield]][license-url]


<div align='center'>
  <a href="https://github.com/xigma0512/XBlockFire">
    <img src="../images/logo.png" alt="Logo" width="250" height="250">
  </a>
</div>

<br />
<div align="center">
<h1 align="center">XBlockFire</h1>

  <p align="center">
    An open-source First-Person Shooter (FPS) game built on Minecraft Bedrock Edition.
    <br />
    <a href="https://github.com/xigma0512/XBlockFire/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/xigma0512/XBlockFire/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

---

## Introduction

**XBlockFire** is an open-source project aiming to bring First-Person Shooter gameplay into the world of Minecraft Bedrock Edition. It has successfully implemented the classic **BombPlant mode**, with plans to incorporate more game modes in the future.

### Project Core Features

* **Multi-Mode Game Framework:** While currently centered around **BombPlant mode**, the project is designed with future expandability in mind, allowing for easy integration of other game modes.
    * **BombPlant Mode Implementation:** Fully realizes the core mechanics of attacker vs. defender confrontations, including round-based gameplay, C4 planting and defusing, and an economic system.
* **Highly Customizable:** The project provides detailed configuration files, allowing users to adjust game phase durations (e.g., preparation, buying, action phases), as well as round rewards, winning scores, and other game parameters.
* **Flexible Map Configuration:** Through the `GameMap.ts` file, users can easily define and add custom maps, including setting attacker and defender spawn points, and C4 bomb target locations.

### How to Contribute

**XBlockFire** is an open-source project, and we warmly welcome collaboration from individuals with relevant skills. For detailed information, please refer to [Contributing](#contributing).

We believe that through the power of the community, **XBlockFire** can become an even richer and more complete game.

---

## Getting Started

### Playing

Versions tested for stable operation will be packaged as **`.mcaddon` files** and published on the [Releases](https://github.com/xigma0512/XBlockFire/releases).

This add-on has been tested on specific Minecraft Bedrock Edition versions. Please ensure your game version matches the recommended version indicated on the [Releases](https://github.com/xigma0512/XBlockFire/releases) for the best gaming experience.

### Configuration

You can customize your world by modifying the settings.

* **Configure time settings and more in BombPlant mode**

```typescript
// base/gamephase/bomb_plant/_config.ts
export const Config = {
    idle: {
        AUTO_START: true,           // Whether to start the countdown after a certain number of players is reached
        AUTO_START_MIN_PLAYER: 10,  // Minimum number of players to start the countdown
        COUNTDOWN_TIME: 30 * 20     // Countdown time (game ticks = seconds * 20)
    },
    buying: {
        COUNTDOWN_TIME: 20 * 20     // Countdown time for the buying phase
    },
    action: {
        ACTION_TIME: 120 * 20       // Round time for the action phase
    },
    C4planted: {
        COUNTDOWN_TIME: 50 * 20     // Time until explosion after C4 is planted, currently not modifiable
    },
    roundEnd: {
        INCOME: [3000, 1500],       // Economic distribution after round end [(winning team), (losing team)]
        WINNING_SCORE: 7,           // Number of rounds to win
        COUNTDOWN_TIME: 5 * 20      // Waiting time at the end of the round
    },
    gameover: {
        COUNTDOWN_TIME: 10 * 20     // Waiting time at the end of the game
    }
}
```

    **Time Unit Explanation:** In all time settings, the unit is **game ticks**. 1 second equals 20 game ticks, so to set 30 seconds, the value would be `30 * 20`. Currently, the countdown time for the `C4planted` phase is not supported for modification. This is to ensure game balance or due to technical limitations. Future versions may consider opening up this setting.

* **Configure GameMap to customize your maps**

```typescript
// base/gamemap/GameMap.ts
export default {
    0: {
        // Map ID
        id: 0,
        // Map Name
        name: 'Melon Map',
        // Map Description
        description: 'A Good Map',
        // Coordinates used in the game
        positions: {
            // Attacker spawn points, positions will be allocated from top to bottom
            attacker_spawns: [
                { x: 208, y: 93, z: 480 },
                { x: 208, y: 93, z: 478 },
                { x: 208, y: 93, z: 476 },
                { x: 206, y: 93, z: 479 },
                { x: 206, y: 93, z: 477 }
            ],
            // Defender spawn points, positions will be allocated from top to bottom
            defender_spawns: [
                { x: 256, y: 93, z: 436 },
                { x: 256, y: 93, z: 438 },
                { x: 256, y: 93, z: 440 },
                { x: 258, y: 93, z: 437 },
                { x: 258, y: 93, z: 439 }
            ],
            // Bomb target points, C4 can only be planted within a 4.5 block radius around these locations
            C4_targets: [
                { x: 228, y: 93, z: 440 },
                { x: 253, y: 93, z: 463 }
            ]
        }
    }
} as Record<number, GameMapType>;
```

    **Getting In-Game Coordinates:** You can use `/tp ~ ~ ~` in-game or enable coordinate display (Settings -> Game -> Show Coordinates) to get the precise X, Y, Z coordinates of your current location, which is useful for setting spawn points and **C4 target points**.

    **C4 Target Points and Planting Range:** `C4_targets` define the locations where C4 bombs can be planted. Players must be within a **4.5 block radius** of these target points to successfully plant the C4. This means the bomb can be placed within a larger area around the target point's center, providing some flexibility.

    **Adding Custom Maps:** To add more custom maps, simply add a new map ID and its corresponding settings in the `GameMap.ts` file, following the format of existing map `0`. Ensure each map ID is unique.



## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](https://github.com/xigma0512/XBlockFire/blob/master/LICENSE) file for more details.


## Contributing

We highly welcome and appreciate contributions of any form! Your help is vital to this project.

### How to Contribute?

* **Report Issues or Suggest Features (Issues & Feature Requests)**: If you find any bugs, have questions, or have new feature suggestions for the project, feel free to open an issue on our [GitHub Issues](https://github.com/xigma0512/XBlockFire/issues/new) page.

* **Provide Technical Support**:
    * Animations: Including reloading, shooting, weapon switching, etc.
    * Models: High-quality 3D gun models.
    * Sound Effects: Shooting, reloading, bolt/slide release sounds, etc.
    * Other: Any other technical assistance.

* **Directly Contribute Code or Features**:
    * Fork the Project
    * Create your Feature Branch (git checkout -b feature/AmazingFeature)
    * Commit your Changes (git commit -m 'Add some AmazingFeature')
    * Push to the Branch (git push origin feature/AmazingFeature)
    * Open a Pull Request

If you can provide relevant resources or know where to find high-quality free/open-source resources, please [contact us](#contact).

### Top Contributors

<a href="https://github.com/xigma0512/XBlockFire/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=xigma0512/XBlockFire" alt="Contributors Graph" />
</a>


## Contact

**Discord**: @xigma0512

**Discord Community**: https://discord.gg/mUwJukn23N

**Project Link**: https://github.com/xigma0512/XBlockFire



## Acknowledgements

* [Script API Reference Documentation](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/?view=minecraft-bedrock-experimental)
* [Bedrock Samples](https://github.com/Mojang/bedrock-samples)
* [Bedrock Wiki](https://wiki.bedrock.dev/)

[contributors-shield]: https://img.shields.io/github/contributors/xigma0512/XBlockFire.svg?style=for-the-badge
[contributors-url]: https://github.com/xigma0512/XBlockFire/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/xigma0512/XBlockFire.svg?style=for-the-badge
[forks-url]: https://github.com/xigma0512/XBlockFire/network/members

[stars-shield]: https://img.shields.io/github/stars/xigma0512/XBlockFire.svg?style=for-the-badge
[stars-url]: https://github.com/xigma0512/XBlockFire/stargazers

[issues-shield]: https://img.shields.io/github/issues/xigma0512/XBlockFire.svg?style=for-the-badge
[issues-url]: https://github.com/xigma0512/XBlockFire/issues

[license-shield]: https://img.shields.io/github/license/xigma0512/XBlockFire.svg?style=for-the-badge
[license-url]: https://github.com/xigma0512/XBlockFire/blob/master/LICENSE.txt