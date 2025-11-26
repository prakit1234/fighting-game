# Hidanshu Ko Kaun Marega? - Blueprint

## Overview

"Hidanshu Ko Kaun Marega?" is a web-based, speedrun-style fighting game. The player's objective is to defeat a series of five bosses in the shortest time possible. The game features a simplified, Tekken-like combat system, a timer, and a leaderboard.

## Features

### Core Gameplay
- **Game Goal:** Defeat all 5 bosses as fast as possible.
- **Timer:** A timer starts at the beginning of the game. The final time is recorded upon completion.
- **Leaderboard:** Players can enter their name at the start of the game. Upon completion, their name and time are added to a leaderboard stored in the browser.

### Fighting System
- **Player Controls:**
    - **A/D:** Move Left/Right
    - **W/Space:** Jump
    - **J:** Punch
    - **K:** Kick
    - **L:** Special Attack
- **Combos:** Simple sequence combos like `J+J+K` and `K+K+L` trigger enhanced moves.
- **Stamina:** A regenerating resource required for performing powerful special attacks.

### Bosses
1.  **YASII MIYA (Easy):** Shoots projectiles.
2.  **JUPITER KA BETA (Medium):** Has a temporary damage-blocking shield.
3.  **ARJYA SULTAN (Hard):** Can teleport and use a long-range shadow punch.
4.  **JUNAK BLACK BELT (Very Hard):** Has high HP, a ground smash area-of-effect (AoE) attack, and a rage mode at low health.
5.  **HELLBLADE HIDANSHU (Final Boss):** Wields a sword, shoots a fire slash beam, is highly mobile, and can parry attacks.

### Visual Design & Effects
- **Sprite-based Graphics:** All characters are rendered using custom SVG images.
- **Attack Animations:** The player has distinct sprites for idle, punching, and kicking states.
- **Parallax Background:** A dynamic, multi-layered scrolling background creates a sense of depth.
- **Camera Shake:** Special attacks and powerful hits trigger a screen shake effect.
- **Modern Aesthetics:** The game features a clean, modern UI with a dark theme, custom fonts, and glowing effects.
- **Particle System:** Dynamic particles provide visual feedback for special attacks, parries, and damage impacts.

### Audio
- **Sound Effects:** Impactful sounds for punches, kicks, jumps, special attacks, and parries.
- **Dynamic Background Music:** The background music changes based on the context, with a more intense track for the final boss battle.

## Implementation History

- **Phase 1: Core Implementation:** All core gameplay mechanics, UI, boss AI, and the leaderboard system were implemented.
- **Phase 2: Visual Overhaul:**
    - [x] Replaced all placeholder geometric shapes with SVG sprites.
    - [x] Added distinct attack animation sprites for the player.
    - [x] Implemented a dynamic, parallax-scrolling background.
    - [x] Added a camera shake effect to combat.
- **Phase 3: Advanced Visual Polish:**
    - [x] **Refined UI/UX:**
        -   [x] Incorporated the "Orbitron" font for a unique, tech-inspired visual identity.
        -   [x] Added gradients, shadows, and glowing effects to UI elements (health bars, buttons) for more depth.
    - [x] **Enhanced Attack VFX:**
        -   [x] Designed an explosive particle effect for the player's special attack.
        -   [x] Created a distinct, glowing shield and spark effect for HELLBLADE HIDANSHU's parry.
        -   [x] Improved the visual feedback for JUNAK BLACK BELT's ground smash with a clear shockwave and debris particles.
- **Phase 4: Audio Integration:**
    - [x] **Integrated Sound Effects:**
        -   [x] Added sound effects for core actions: punches, kicks, and jumps.
        -   [x] Added a unique sound for the player's special attack.
        -   [x] Added a sound for the final boss's parry.
    - [x] **Added Background Music:**
        -   [x] Sourced and integrated a main background music track.
        -   [x] Implemented a more intense background track for the final boss fight to heighten the drama.

## Current Plan

### Phase 5: Final Polish & Deployment
1.  **Complete Audio Integration:**
    -   Add sound effects for taking damage.
    -   Add UI sounds for button clicks and screen transitions.
2.  **Code Review & Optimization:**
    -   Perform a final pass over the codebase to clean up, comment, and optimize for performance.
3.  **Deployment:**
    -   Configure the project for deployment.
    -   Deploy the game to Firebase Hosting for public access.
