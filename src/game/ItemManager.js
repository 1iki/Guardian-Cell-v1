import {
    GAME_WIDTH,
    GAME_HEIGHT,
    SPAWN_RATE_INITIAL,
} from './Constants';

import fish1Src from '../assets/fish-1.png';
import fishRedSnapperSrc from '../assets/fish-red_snapper.png';
import fruitApelSrc from '../assets/fruit-apel.png';
import fruitTomatoSrc from '../assets/fruit-tomato.png';
import vegBroccoliSrc from '../assets/vegetables-Broccoli.png';
import vegEggplantSrc from '../assets/vegetables-eggplant.png';
import vegOnionSrc from '../assets/vegetables-onion.png';
import vegWortelSrc from '../assets/vegetables-wortel.png';

const ITEM_TYPES = [
    // Fish (1 Health)
    { type: 'FISH_1', imgSrc: fish1Src, score: 0, health: 1.0, radius: 25 },
    { type: 'FISH_RED_SNAPPER', imgSrc: fishRedSnapperSrc, score: 0, health: 1.0, radius: 25 },

    // Vegetables (1 Health)
    { type: 'VEG_BROCCOLI', imgSrc: vegBroccoliSrc, score: 0, health: 1.0, radius: 25 },
    { type: 'VEG_EGGPLANT', imgSrc: vegEggplantSrc, score: 0, health: 1.0, radius: 25 },
    { type: 'VEG_ONION', imgSrc: vegOnionSrc, score: 0, health: 1.0, radius: 25 },
    { type: 'VEG_WORTEL', imgSrc: vegWortelSrc, score: 0, health: 1.0, radius: 25 },

    // Fruit (0.5 Health)
    { type: 'FRUIT_APEL', imgSrc: fruitApelSrc, score: 0, health: 0.5, radius: 25 },
    { type: 'FRUIT_TOMATO', imgSrc: fruitTomatoSrc, score: 0, health: 0.5, radius: 25 }
];

export class ItemManager {
    constructor() {
        this.items = [];
        this.spawnTimer = 0;
        this.spawnInterval = 3.0; // Items spawn less frequently than enemies?

        // Preload Images
        this.loadedImages = {};
        ITEM_TYPES.forEach(type => {
            const img = new Image();
            img.src = type.imgSrc;
            this.loadedImages[type.type] = img;
        });
    }

    update(dt, pathManager) {
        // Spawning
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnItem(pathManager);
            this.spawnTimer = this.spawnInterval + Math.random() * 2; // Randomize interval
        }

        // Movement
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            // Items move same speed as "scroll"? Or slightly different?
            // Let's make them drift down like enemies but maybe slower/faster?
            // Let's say they flow with the stream: 150-200 px/s
            item.y += 180 * dt;

            // Remove if off screen
            if (item.y - item.radius > GAME_HEIGHT) {
                this.items.splice(i, 1);
            }
        }
    }

    spawnItem(pathManager) {
        // Random type
        const typeConfig = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];

        const spawnY = -50;
        let minX = 0;
        let maxX = GAME_WIDTH;

        if (pathManager) {
            const bounds = pathManager.getBoundsAt(0);
            minX = bounds.min;
            maxX = bounds.max;
        }

        const x = minX + Math.random() * (maxX - minX);

        this.items.push({
            x: x,
            y: spawnY,
            ...typeConfig
        });
    }

    checkCollision(player) {
        // Circle collision
        // Returns the Item object if collision, null otherwise
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const dx = player.x - item.x;
            const dy = player.y - item.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < player.radius + item.radius) {
                // Collided
                this.items.splice(i, 1); // Remove item
                return item;
            }
        }
        return null;
    }

    draw(ctx) {
        for (const item of this.items) {
            const img = this.loadedImages[item.type];

            // Add Green Glow
            ctx.save();
            ctx.shadowColor = '#00FF00'; // Bright Green
            ctx.shadowBlur = 15;

            if (img && img.complete) {
                // Preserve Aspect Ratio logic
                const aspect = img.width / img.height;
                let drawW = item.radius * 2;
                let drawH = item.radius * 2;

                if (aspect > 1) {
                    drawH = drawW / aspect;
                } else {
                    drawW = drawH * aspect;
                }

                ctx.drawImage(
                    img,
                    item.x - drawW / 2,
                    item.y - drawH / 2,
                    drawW,
                    drawH
                );
            } else {
                ctx.fillStyle = 'gold';
                ctx.beginPath();
                ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }
}
