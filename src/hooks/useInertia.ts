import { useRef, useCallback } from 'react';
import { decay } from "@/utilities";

// Interface for velocity in pixels per second
interface Velocity {
    x: number;
    y: number;
}

// Props for useInertia hook
interface useInertiaProps {
    lockX?: boolean,
    lockY?: boolean,
    friction?: number
}

/**
 * Hook to add scroll inertia to an object.
 * @param lockX - Optional scroll lock for the X axis.
 * @param lockY - Optional scroll lock for the Y axis.
 * @param friction - Friction to represent the amount of speed to decay a second. Set nice and high.
 */
const useInertia = ({
    lockX = false,
    lockY = false,
    friction = .95 // Where friction is a velocity decay over a second
}: useInertiaProps) => {

    // useRef over state to prevent excessive re-renders (high frequency updates)
    const velocity: React.MutableRefObject<Velocity> = useRef<Velocity>({ x: 0, y: 0 });

    // Store the DOM element effected by inertia
    const nodeRef: React.MutableRefObject<HTMLElement | null> = useRef<HTMLElement | null>(null);

    // Hold the last frame time as a reference
    const lastFrameTime: React.MutableRefObject<number> = useRef<number>(0);

    // Recursive function to apply inertia based on animation frame timings
    const scroll = useCallback((currentTime: DOMHighResTimeStamp) => {
        if (!nodeRef.current) return;

        // Assume that if the lastFrameTime is 0, we won't start slowing
        if (lastFrameTime.current === 0) {
            lastFrameTime.current = currentTime;
            requestAnimationFrame(scroll);
            return;
        }

        // Turn time delta to seconds
        const secondsDelta: number = (currentTime - lastFrameTime.current) / 1000;
        lastFrameTime.current = currentTime;

        // Decay the velocity
        velocity.current.x = decay(velocity.current.x, secondsDelta, friction);
        velocity.current.y = decay(velocity.current.y, secondsDelta, friction);

        // Apply movement to the scroll positions
        if (!lockX)
            nodeRef.current.scrollLeft -= velocity.current.x * secondsDelta;

        if (!lockY)
            nodeRef.current.scrollTop -= velocity.current.y * secondsDelta;

        // If we don't have velocity over the tolerance of 1, remove the lingering velocity and return
        if (Math.abs(velocity.current.x) < 1 || Math.abs(velocity.current.y) < 1) {
            velocity.current.x = 0;
            velocity.current.y = 0;
            return;
        }
        
        requestAnimationFrame(scroll);
        
    }, [friction, lockX, lockY]);

    // Function to apply inertia to reference node
    const applyInertia = useCallback(() => {
        // Guard against null ref
        if (!nodeRef.current) return;

        // Reset the last frame time
        lastFrameTime.current = 0;
        
        // Set initial inertia
        requestAnimationFrame(scroll);
    }, [scroll]);

    // Set node with initial callback
    const setInertiaNode = useCallback((element: HTMLElement | null) => {
        // Guard for null
        if (element === null) {
            nodeRef.current = null;
            return;
        }

        // Guard for non elements
        if (!(element instanceof HTMLElement)) {
            console.error(`Inertia can't be applied to a non html element`);
            return;
        }

        nodeRef.current = element;
    }, []);

    return { setInertiaNode, velocity, applyInertia };
};

export default useInertia;