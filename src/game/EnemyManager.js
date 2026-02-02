import {
    GAME_WIDTH,
    GAME_HEIGHT,
    COLORS,
    SPAWN_RATE_INITIAL,
} from './Constants';

import germSrc from '../assets/germ.png';
import greenBackteriSrc from '../assets/greenBackteri.png';
import purpleBackteriSrc from '../assets/purpleBackteri.png';
import virus1Src from '../assets/virus-1.png';
import virus2Src from '../assets/virus-2.png';

const ENEMY_TYPES = [
    { type: 'GERM', imgSrc: germSrc, radius: 25, speed: 200, score: 10 },
    { type: 'BACTERIA_GREEN', imgSrc: greenBackteriSrc, radius: 28, speed: 150, score: 20 },
    { type: 'BACTERIA_PURPLE', imgSrc: purpleBackteriSrc, radius: 28, speed: 150, score: 20 },
    { type: 'VIRUS_1', imgSrc: virus1Src, radius: 30, speed: 250, score: 30 },
    { type: 'VIRUS_2', imgSrc: virus2Src, radius: 30, speed: 280, score: 35 }
];

export class EnemyManager {
    constructor() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = SPAWN_RATE_INITIAL;
        this.elapsedTime = 0; // To increase difficulty

        // Preload Images
        this.loadedImages = {};
        ENEMY_TYPES.forEach(type => {
            const img = new Image();
            img.src = type.imgSrc;
            this.loadedImages[type.type] = img;
        });

        this.seenTypes = new Set();
    }

    // Changed signature to accept onFirstEncounter
    update(dt, pathManager, onFirstEncounter) {
        this.elapsedTime += dt;

        // Difficulty: Decrease spawn interval over time (min 0.3s)
        const currentInterval = Math.max(0.3, SPAWN_RATE_INITIAL - (this.elapsedTime * 0.02));

        // Spawning
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnEnemy(pathManager, onFirstEncounter);
            this.spawnTimer = currentInterval;
        }

        // Movement
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.y += enemy.speed * dt;

            // Remove if off screen
            if (enemy.y - enemy.radius > GAME_HEIGHT) {
                this.enemies.splice(i, 1);
            }
        }
    }

    spawnEnemy(pathManager, onFirstEncounter) {
        // Random type
        const typeConfig = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];

        // Get bounds at Spawn Height (Y = -50 approx)
        // We use 0 (Top of screen) for simplicity as they fall in.
        // Or slightly above 0.
        const spawnY = -50;
        let minX = 0;
        let maxX = GAME_WIDTH;

        if (pathManager) {
            const bounds = pathManager.getBoundsAt(0); // Top of screen
            minX = bounds.min;
            maxX = bounds.max;
        }

        const x = minX + Math.random() * (maxX - minX);

        this.enemies.push({
            x: x,
            y: spawnY,
            ...typeConfig
        });

        // Trigger First Encounter Tutorial
        if (onFirstEncounter && !this.seenTypes.has(typeConfig.type)) {
            this.seenTypes.add(typeConfig.type);
            onFirstEncounter(typeConfig);
        }
    }

    checkCollision(player) {
        // Circle to Circle
        for (const enemy of this.enemies) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < player.radius + enemy.radius) {
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        for (const enemy of this.enemies) {
            const img = this.loadedImages[enemy.type];

            // Add Red Glow Effect
            ctx.save(); // Save context to reset shadow later
            ctx.shadowColor = '#FF0000'; // Bright Red
            ctx.shadowBlur = 20; // Strong Glow

            if (img && img.complete) {
                // Calculate dimensions preserving aspect ratio
                // We fit the largest dimension to the diameter (radius * 2)
                const aspect = img.width / img.height;
                let drawW = enemy.radius * 2;
                let drawH = enemy.radius * 2;

                if (aspect > 1) {
                    // Wider than tall
                    drawH = drawW / aspect;
                } else {
                    // Taller than wide
                    drawW = drawH * aspect;
                }

                ctx.drawImage(
                    img,
                    enemy.x - drawW / 2,
                    enemy.y - drawH / 2,
                    drawW,
                    drawH
                );
            } else {
                // Fallback to circle
                ctx.fillStyle = enemy.color || 'white';
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore(); // Restore context to remove shadow for other elements

            /* Debug Hitbox
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.stroke();
            */
        }
    }
}
