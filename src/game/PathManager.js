import {
    GAME_WIDTH,
    GAME_HEIGHT,
    SAFE_ZONE_BASE_WIDTH,
    PATH_AMPLITUDE,
    PATH_FREQUENCY,
    SCROLL_SPEED
} from './Constants';

export class PathManager {
    constructor() {
        this.worldY = 0; // Total distance scrolled
    }

    update(dt) {
        this.worldY += SCROLL_SPEED * dt;
    }

    // Get the center X of the path at a specific World Y
    getCenterAt(y) {
        // Simple Sine wave
        // y is the world coordinate (increasing as we scroll)
        // ensure to add worldY to the requested screen y to get absolute world position
        return (GAME_WIDTH / 2) + Math.sin(y * PATH_FREQUENCY) * PATH_AMPLITUDE;
    }

    // Get boundaries at a specific Screen Y (0 to GAME_HEIGHT)
    getBoundsAt(screenY) {
        const absoluteY = this.worldY + (GAME_HEIGHT - screenY);
        // Note: In this game, usually "up" is 0. But for scrolling games, 
        // typically "worldY" represents the top of the screeen or bottom?
        // Let's assume WorldY = 0 is start. We move "forward" (up the vessel).
        // But the visual effect is walls moving DOWN.
        // So WorldY increases.
        // Screen Y=0 (top) is currently at WorldY + GAME_HEIGHT (if we say we move up)
        // OR Screen Y=0 is WorldY?
        // Let's stick to: Player is at some Y.
        // We simulate "flying forward".
        // Code: `this.worldY += SCROLL_SPEED * dt` -> we are moving forward.
        // Center calculation needs an Absolute Y.

        // Let's say we are looking at `worldY` at the BOTTOM of the screen.
        // Then at Screen Y, the absolute Y is `worldY + (GAME_HEIGHT - screenY)` if Y points down?
        // Actually, usually in Canvas Y=0 is TOP.
        // So at Screen Y=0 (Top), we are FURTHER ahead in the tunnel than at Screen Y=Height (Bottom).
        // So AbsoluteY = this.worldY + (GAME_HEIGHT - screenY).
        // Wait, if we move UP, the stuff at Top (0) is "future" path, stuff at Bottom (Height) is "current/past".

        // Let's simplify: 
        // `this.worldY` is the "distance traveled".
        // Screen Y=0 (top) is `this.worldY + GAME_HEIGHT`. 
        // Screen Y=Height (bottom) is `this.worldY`.
        // (Assuming we are flying UP).

        // Let's reverse: "Pathogens ... fall downwards". Player is at bottom.
        // So we are defending. So we are effectively moving UP the stream? Or just holding ground?
        // If we want Parallax, we usually simulate moving FORWARD (Up).
        // So:
        const lookAhead = GAME_HEIGHT - screenY; // 0 at bottom, Height at top.
        const targetWorldY = this.worldY + lookAhead;

        const centerX = this.getCenterAt(targetWorldY);
        const halfWidth = SAFE_ZONE_BASE_WIDTH / 2;

        return {
            min: centerX - halfWidth,
            max: centerX + halfWidth,
            centerX: centerX
        };
    }
}
