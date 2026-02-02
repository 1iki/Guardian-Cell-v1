import {
    GAME_WIDTH,
    GAME_HEIGHT,
    PLAYER_RADIUS,
    PLAYER_SPEED,
    COLORS,
} from './Constants';

import playerUpSrc from '../assets/player-up.png';
import playerDownSrc from '../assets/player-down.png';
import playerLeftSrc from '../assets/player-left.png';
import playerRightSrc from '../assets/player-right.png';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = PLAYER_RADIUS;
        this.facing = 'UP'; // UP, DOWN, LEFT, RIGHT
        this.health = 3.0; // Max 3
        this.maxHealth = 3.0;
        this.invulnerableTime = 0;
        this.invulnerableDuration = 2.0; // 2 seconds of iframes

        // Preload Sprites
        this.sprites = {
            UP: new Image(),
            DOWN: new Image(),
            LEFT: new Image(),
            RIGHT: new Image()
        };
        this.sprites.UP.src = playerUpSrc;
        this.sprites.DOWN.src = playerDownSrc;
        this.sprites.LEFT.src = playerLeftSrc;
        this.sprites.RIGHT.src = playerRightSrc;
    }

    update(dt, inputManager, pathManager) {
        if (this.invulnerableTime > 0) {
            this.invulnerableTime -= dt;
        }

        // 1. Keyboard Movement
        const moveDir = inputManager.getMovementVector();
        this.x += moveDir.x * PLAYER_SPEED * dt;
        this.y += moveDir.y * PLAYER_SPEED * dt;

        // 2. Touch/Drag Movement
        const dragDelta = inputManager.getDragDelta();
        this.x += dragDelta.x;
        this.y += dragDelta.y;

        // Determine Facing Direction
        // Prioritize Keyboard if active, then Touch
        let dx = 0;
        let dy = 0;

        if (moveDir.x !== 0 || moveDir.y !== 0) {
            dx = moveDir.x;
            dy = moveDir.y;
        } else if (dragDelta.x !== 0 || dragDelta.y !== 0) {
            dx = dragDelta.x;
            dy = dragDelta.y;
        }

        if (dx !== 0 || dy !== 0) {
            if (Math.abs(dx) > Math.abs(dy)) {
                this.facing = dx > 0 ? 'RIGHT' : 'LEFT';
            } else {
                this.facing = dy > 0 ? 'DOWN' : 'UP';
            }
        }

        // 3. Dynamic Boundaries (Winding Path)
        if (pathManager) {
            const bounds = pathManager.getBoundsAt(this.y);

            // Left Wall
            if (this.x - this.radius < bounds.min) {
                this.x = bounds.min + this.radius;
            }
            // Right Wall
            if (this.x + this.radius > bounds.max) {
                this.x = bounds.max - this.radius;
            }
        }

        // Top Bound
        if (this.y - this.radius < 0) this.y = this.radius;
        // Bottom Bound
        if (this.y + this.radius > GAME_HEIGHT) this.y = GAME_HEIGHT - this.radius;
    }

    heal(amount) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }

    takeDamage(amount) {
        if (this.invulnerableTime > 0) return; // Ignore damage if invulnerable

        this.health -= amount;
        if (this.health < 0) this.health = 0;

        // Trigger invulnerability
        this.invulnerableTime = this.invulnerableDuration;
    }

    // Return collision status
    checkWallCollision(pathManager) {
        if (!pathManager) return false;

        const bounds = pathManager.getBoundsAt(this.y);

        // Strict check slightly inside the clamped bounds to detect "hitting" vs "sliding"
        // But since we clamp in update, we check if we are AT the edge.
        return (
            this.x - this.radius <= bounds.min + 1 ||
            this.x + this.radius >= bounds.max - 1
        );
    }

    draw(ctx) {
        ctx.save();

        // Flashing effect if invulnerable
        if (this.invulnerableTime > 0) {
            // Blink every 0.1s
            if (Math.floor(this.invulnerableTime * 10) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
        }

        const img = this.sprites[this.facing];

        if (img && img.complete) {
            // Glow Effect behind sprite
            ctx.shadowBlur = 15;
            ctx.shadowColor = COLORS.PLAYER_GLOW;

            // Draw Sprite
            // Preserve aspect ratio
            const aspect = img.width / img.height;
            let drawW = this.radius * 2.5; // Slightly larger visually
            let drawH = this.radius * 2.5;

            if (aspect > 1) {
                drawH = drawW / aspect;
            } else {
                drawW = drawH * aspect;
            }

            ctx.drawImage(
                img,
                this.x - drawW / 2,
                this.y - drawH / 2,
                drawW,
                drawH
            );
        } else {
            // Fallback
            ctx.shadowBlur = 15;
            ctx.shadowColor = COLORS.PLAYER_GLOW;
            ctx.fillStyle = COLORS.PLAYER;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
