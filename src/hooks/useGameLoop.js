import { useEffect, useRef } from 'react';

export const useGameLoop = (callback, isActive = true) => {
    const requestRef = useRef();
    const previousTimeRef = useRef();
    const callbackRef = useRef(callback);

    // Update callback ref to avoid effect cleanup on callback change
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!isActive) {
            previousTimeRef.current = undefined;
            return;
        }

        const loop = (time) => {
            if (previousTimeRef.current !== undefined) {
                const deltaTime = (time - previousTimeRef.current) / 1000; // Convert to seconds
                callbackRef.current(deltaTime);
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isActive]);
};
