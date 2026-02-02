import React, { useEffect, useRef } from 'react';
import {
    GAME_WIDTH,
    GAME_HEIGHT,
    GAME_DURATION,
    COLORS
} from '../game/Constants';
import { Player } from '../game/Player';
import { EnemyManager } from '../game/EnemyManager';
import { InputManager } from '../game/InputManager';
import { useGameLoop } from '../hooks/useGameLoop';
import { PathManager } from '../game/PathManager';
import { ItemManager } from '../game/ItemManager';
import bgImageSrc from '../assets/flat-background.png';
import heartFullSrc from '../assets/heart-full.png';
import heartHalfSrc from '../assets/heart-half.png';

export const GameCanvas = ({ gameState, onGameOver, onVictory, setTimer, onTutorial }) => {
    const canvasRef = useRef(null);

    // Game Entities Refs (persist across renders)
    const playerRef = useRef(null);
    const enemyManagerRef = useRef(null);
    const itemManagerRef = useRef(null);
    const inputManagerRef = useRef(null);
    const pathManagerRef = useRef(null);
    const bgImageRef = useRef(null);
    const heartImagesRef = useRef(null);

    // Initialize Game Logic
    useEffect(() => {
        // Only init if we don't have them (or on reset)
        // Actually, on mount we init.
        // If gameState resets to PLAYING from something else, we might want to reset entities.
        // Let's rely on the parent mounting/unmounting or specific reset prop.
        // For simplicity, we assume GameCanvas is remounted or we have a reset method.

        pathManagerRef.current = new PathManager();

        // Load Image
        const img = new Image();
        img.src = bgImageSrc;
        img.onload = () => {
            bgImageRef.current = img;
        };

        // Load Heart Images
        const hFull = new Image(); hFull.src = heartFullSrc;
        const hHalf = new Image(); hHalf.src = heartHalfSrc;
        heartImagesRef.current = { FULL: hFull, HALF: hHalf };

        playerRef.current = new Player(GAME_WIDTH / 2, GAME_HEIGHT - 100);
        enemyManagerRef.current = new EnemyManager();
        itemManagerRef.current = new ItemManager();
        inputManagerRef.current = new InputManager();

        return () => {
            // Cleanup events
            inputManagerRef.current.cleanup();
        };
    }, []);

    // Timer state is managed by parent or ref here?
    // Passed `setTimer` to update HUD.
    const timeLeftRef = useRef(GAME_DURATION);

    const update = (dt) => {
        if (gameState !== 'PLAYING') return;

        const player = playerRef.current;
        const enemyManager = enemyManagerRef.current;
        const itemManager = itemManagerRef.current;
        const input = inputManagerRef.current;
        const pathManager = pathManagerRef.current;

        // 1. Update Entities
        pathManager.update(dt);
        player.update(dt, input, pathManager);
        // Pass onFirstEncounter callback to update which passes it to spawnEnemy
        enemyManager.update(dt, pathManager, (enemyConfig) => {
            if (onTutorial) {
                onTutorial({ type: 'ENEMY', data: enemyConfig });
            }
        });
        itemManager.update(dt, pathManager);

        // Check Item Collection
        const collectedItem = itemManager.checkCollision(player);
        if (collectedItem) {
            player.heal(collectedItem.health);
            // Tutorial: Item Collection
            if (onTutorial) onTutorial({ type: 'ITEM', data: collectedItem });
        }

        // 2. Check Game Over Conditions

        // Wall Collision
        if (player.checkWallCollision(pathManager)) {
            onGameOver(
                "Yah, kamu keluar jalur vena",
                "Jangan Keluar Jalur Vena yah, Ada Selaput Infeksi Yang Membutuhkan Kita"
            );
            return;
        }

        // Enemy Collision (Damage instead of Game Over)
        if (enemyManager.checkCollision(player)) {
            player.takeDamage(0.5);
            // Tutorial: Taken Damage (First Time)
            if (onTutorial) onTutorial({ type: 'DAMAGE' });
        }

        // Check Health Depleted
        if (player.health <= 0) {
            onGameOver();
            return;
        }

        // 3. Update Timer
        timeLeftRef.current -= dt;
        setTimer(Math.max(0, timeLeftRef.current));

        if (timeLeftRef.current <= 0) {
            onVictory();
        }
    };

    const draw = (dt) => { // dt passed but usually not needed for draw unless interpolation
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Draw Background
        const pathManager = pathManagerRef.current;
        if (!pathManager) return; // Paranoia

        // 1. Draw "Deep" Tissue Background (Parallax Layer 1)
        // A simple scrolling texture or gradient
        // We use the worldY to offset a pattern
        const scrollY = pathManager.worldY * 0.5; // Slower scroll for depth

        const bgImg = bgImageRef.current;

        if (bgImg && bgImg.complete) {
            // Draw Repeating Image
            // We need to cover GAME_HEIGHT.
            // The image might be smaller or larger.
            // Let's assume we want to scale it to fit width? Or keep aspect ratio?
            // "flat-background.png" 6MB is probably high res.
            // Let's fit Width to GAME_WIDTH.
            const aspect = bgImg.height / bgImg.width;
            const drawWidth = GAME_WIDTH;
            const drawHeight = drawWidth * aspect;

            // Calculate offset modulo drawHeight
            const offsetY = scrollY % drawHeight;

            // Draw 2 or 3 tiles to cover the screen
            // Top tile
            ctx.drawImage(bgImg, 0, offsetY - drawHeight, drawWidth, drawHeight);
            // Middle tile (main)
            ctx.drawImage(bgImg, 0, offsetY, drawWidth, drawHeight);
            // Bottom tile (just in case)
            if (offsetY < GAME_HEIGHT) {
                ctx.drawImage(bgImg, 0, offsetY + drawHeight, drawWidth, drawHeight);
            }
        } else {
            // Fallback while loading
            ctx.fillStyle = COLORS.BACKGROUND;
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        }

        // Remove old decorative circles

        // 2. Draw Walls (Kill Zone) and Safe Zone
        // We draw the Safe Zone ON TOP of the Background Image.
        // The Background Image (Tissue) basically REPLACES the Kill Zone fills.
        // So we effectively treated the "Background" as the Tissue/Walls.

        // Skip drawing solid Kill Zone to reveal the parallax image behind.
        /*
        ctx.fillStyle = COLORS.KILL_ZONE;
        
        // Left Wall Path
        ctx.beginPath();
        ctx.moveTo(0, 0); // Top Left
        
        // Trace the Left Boundary inner edge
        for (let y = 0; y <= GAME_HEIGHT; y += 20) {
            const bounds = pathManager.getBoundsAt(y);
            ctx.lineTo(bounds.min, y);
        }
        ctx.lineTo(0, GAME_HEIGHT); // Bottom Left
        ctx.closePath();
        ctx.fill();

        // Right Wall Path
        ctx.beginPath();
        ctx.moveTo(GAME_WIDTH, 0); // Top Right
        
        // Trace the Right Boundary inner edge
        for (let y = 0; y <= GAME_HEIGHT; y += 20) {
            const bounds = pathManager.getBoundsAt(y);
            ctx.lineTo(bounds.max, y);
        }
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT); // Bottom Right
        ctx.closePath();
        ctx.fill();
        */

        // Center Safe Zone is implicitly whatever is left, but we can fill it if needed.
        // The background color covers the "Safe Zone" essentially.
        // Actually prompt says: "Safe Zone: Lighter Pink", "Kill Zone: Darker Red".
        // Our background (COLORS.BACKGROUND) is "Blood/Tissue".
        // Let's overlay the Safe Zone color between the walls?
        // Or just let the background be the safe zone color?
        // Let's draw the Safe Zone specifically to match the request.

        // Draw Safe Zone (Solid Pink - The Blood Stream)
        // This covers the background image in the center.
        // The "Background Image" (Tissue) is visible on the sides (Kill Zone).
        ctx.fillStyle = COLORS.SAFE_ZONE;
        ctx.beginPath();
        // Trace Left Wall Edge (Top to Bottom)
        for (let y = 0; y <= GAME_HEIGHT; y += 20) {
            const bounds = pathManager.getBoundsAt(y);
            if (y === 0) ctx.moveTo(bounds.min, y);
            else ctx.lineTo(bounds.min, y);
        }
        // Trace Right Wall Edge (Bottom to Top)
        for (let y = GAME_HEIGHT; y >= 0; y -= 20) {
            const bounds = pathManager.getBoundsAt(y);
            ctx.lineTo(bounds.max, y);
        }
        ctx.closePath();
        ctx.fill();

        // Outline the vessel
        ctx.lineWidth = 8;
        ctx.strokeStyle = COLORS.BACKGROUND; // #5E0B0B as requested
        ctx.stroke();

        // Draw Entities
        const enemyManager = enemyManagerRef.current;
        const player = playerRef.current;

        const itemManager = itemManagerRef.current;
        if (itemManager) itemManager.draw(ctx);

        if (enemyManager) enemyManager.draw(ctx);
        if (player) player.draw(ctx);

        // Draw HUD (Hearts)
        // Top Left Corner
        const hearts = heartImagesRef.current;
        if (player && hearts && hearts.FULL) { // Check hearts.FULL loaded
            const heartSize = 40;
            const startX = 20;
            const startY = 20;
            const gap = 10;

            // Draw Max Hearts as containers? Or just current health?
            // Prompt: "Player starts with 3 hearts... consume to fill".
            // Implies we show empty/half states.

            for (let i = 0; i < player.maxHealth; i++) {
                let drawImg = null; // Default empty/missing
                // Determine state: Full, Half, Empty
                // i=0, health=2.5 -> Full
                // i=1, health=2.5 -> Full
                // i=2, health=2.5 -> Half

                const healthRem = player.health - i;

                if (healthRem >= 1) {
                    drawImg = hearts.FULL;
                } else if (healthRem >= 0.5) {
                    drawImg = hearts.HALF;
                } else {
                    // Empty - use Full with low opacity
                    ctx.globalAlpha = 0.3;
                    drawImg = hearts.FULL;
                }

                if (drawImg && drawImg.complete) {
                    ctx.drawImage(drawImg, startX + (heartSize + gap) * i, startY, heartSize, heartSize);
                }

                ctx.globalAlpha = 1.0; // Reset
            }
        }
    };

    // Run Loop
    useGameLoop((dt) => {
        update(dt);
        draw(dt);
    }, gameState === 'PLAYING' || gameState === 'GAME_OVER' || gameState === 'VICTORY' || gameState === 'TUTORIAL' || gameState === 'COUNTDOWN');
    // We keep drawing even in Game Over to show the state, but update stops?
    // If update stops, draw will draw static last frame. Good.

    return (
        <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="max-w-full max-h-full"
        />
    );
};
