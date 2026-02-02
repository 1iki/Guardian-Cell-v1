export class InputManager {
    constructor() {
        this.keys = {};
        this.touch = {
            active: false,
            lastX: 0,
            lastY: 0,
            dx: 0,
            dy: 0 // Delta movement since last frame/check
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        this.bind();
    }

    bind() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        // Touch events usually attached to the canvas, but window is safer for global drag
        window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        window.addEventListener('touchend', this.handleTouchEnd);
    }

    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
    }

    handleKeyDown(e) {
        this.keys[e.code] = true;
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    handleTouchStart(e) {
        // Allow interaction with UI elements (Buttons, Inputs)
        if (e.target.tagName === 'BUTTON' ||
            e.target.tagName === 'INPUT' ||
            e.target.tagName === 'A' ||
            e.target.closest('button')) {
            return;
        }

        e.preventDefault(); // Prevent scrolling for game controls
        const touch = e.touches[0];
        this.touch.active = true;
        this.touch.lastX = touch.clientX;
        this.touch.lastY = touch.clientY;
        this.touch.dx = 0;
        this.touch.dy = 0;
    }

    handleTouchMove(e) {
        if (!this.touch.active) return;
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;

        this.touch.dx += currentX - this.touch.lastX; // Accumulate delta
        this.touch.dy += currentY - this.touch.lastY;

        this.touch.lastX = currentX;
        this.touch.lastY = currentY;
    }

    handleTouchEnd() {
        this.touch.active = false;
        this.touch.dx = 0;
        this.touch.dy = 0;
    }

    // Returns normalized vector for keyboard
    getMovementVector() {
        let x = 0;
        let y = 0;

        if (this.keys['ArrowUp'] || this.keys['KeyW']) y -= 1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) y += 1;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) x -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) x += 1;

        // Normalize
        if (x !== 0 || y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            x /= length;
            y /= length;
        }

        return { x, y };
    }

    // Returns accumulated drag delta and resets it (consume delta)
    getDragDelta() {
        const delta = { x: this.touch.dx, y: this.touch.dy };
        this.touch.dx = 0;
        this.touch.dy = 0;
        return delta;
    }
}
