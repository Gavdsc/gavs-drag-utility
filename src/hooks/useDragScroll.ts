import React, { useCallback, useRef } from "react";
import useInertia from "@/hooks/useInertia";
import { speed, distance, TimeDelta, delta } from "@/utilities";

// Interface for position co-ordinates
interface Position {
    left: number,
    top: number,
    x: number,
    y: number,
    time: number
}

// Props for the useDragScroll hook
interface useDragScrollProps {
    scrollFactor?: number,
    lockX?: boolean,
    lockY?: boolean,
    inertia?: boolean,
    friction?: number,
    touchSpeed?: number,
    mouseSpeed?: number
}

/**
 * Hook to enable drag scrolling on an element.
 * @param scrollFactor - Optional multiplier for the scroll speed.
 * @param lockX - Optional scroll lock for the X axis.
 * @param lockY - Option scroll lock for the Y axis.
 * @param inertia - Enable inertia.
 * @param friction - Friction to represent the amount of speed to decay a second. Set nice and high.
 * @param touchSpeed - Micro adjustment for touch inertia (basically touch friction on initial velocity).
 * @param mouseSpeed - Micro adjustment for mouse inertia (basically mouse friction on initial velocity).
 */
export default function useDragScroll({
    scrollFactor = 1,
    lockX = false,
    lockY = false,
    inertia = false,
    friction = 1000,
    touchSpeed = .1,
    mouseSpeed = .05
}: useDragScrollProps = {}): [React.RefCallback<HTMLElement>] {
    // Reference to the scrollable element
    const nodeRef: React.MutableRefObject<HTMLElement | null> = useRef<HTMLElement | null>(null);
    // Flag to indicate if dragging is in progress
    const isDragging: React.MutableRefObject<boolean> = useRef(false);
    // Starting position for dragging
    const currentPos: React.MutableRefObject<Position | null> = useRef<Position | null>(null);

    // Add inertia
    const { setInertiaNode, velocity, applyInertia } = useInertia({
        lockX: lockX,
        lockY: lockY,
        friction: friction
    });

    // Update cursor style to 'grabbing'
    const updateCursor = (ele: HTMLElement): void => {
        ele.style.cursor = 'grabbing';
        ele.style.userSelect = 'none';
    };

    // Reset cursor style to default
    const resetCursor = (ele: HTMLElement): void => {
        ele.style.cursor = 'grab';
        ele.style.removeProperty('user-select');
    };

    // Multipurpose callback event for mouse and touch drags
    const handlePointerDown = useCallback((event: MouseEvent | TouchEvent): void => {
        // Prevent against phone refreshes
        event.preventDefault();

        // Detect the event type
        const pointerEvent: Touch | MouseEvent = 'touches' in event ? event.touches[0] : event;

        if (!nodeRef.current) return;

        // Set dragging flag
        isDragging.current = true;

        // Get the current event positions
        currentPos.current = {
            left: nodeRef.current.scrollLeft,
            top: nodeRef.current.scrollTop,
            x: pointerEvent.clientX,
            y: pointerEvent.clientY,
            time: Date.now(),
        };

        // Cancel inertia on click
        velocity.current.x = 0;
        velocity.current.y = 0;

        // Style stuff
        updateCursor(nodeRef.current);

        // Event for handling pointer moves (touch and mouse)
        const handlePointerMove = (moveEvent: MouseEvent | TouchEvent): void => {
            // Prevent against phone refreshes
            moveEvent.preventDefault();

            // Guard against null values
            if (!isDragging.current || !currentPos.current || !nodeRef.current) return;

            // Detect the event type (boolean to apply correct tolerances)
            const touch: boolean = 'touches' in moveEvent;
            const movePointerEvent: Touch | MouseEvent = touch ? (moveEvent as TouchEvent).touches[0] : (moveEvent as MouseEvent);

            // Get the distances travelled
            const dx: number = distance(currentPos.current.x, movePointerEvent.clientX, scrollFactor);
            const dy: number = distance(currentPos.current.y, movePointerEvent.clientY, scrollFactor);

            // Horizontal and vertical scroll calculations (initial - current) multiplied by the scrollFactor.
            // Amount is subtracted from the current scroll position.
            if (!lockX)
                nodeRef.current.scrollLeft = currentPos.current.left - dx;

            if (!lockY)
                nodeRef.current.scrollTop = currentPos.current.top - dy;

            // Break if no inertia
            if (!inertia)
                return;

            // Get current time and delta since last movement poll
            const timeDelta: TimeDelta = delta(currentPos.current.time);

            // Adjust the speed for mouse and touch based on event
            const eventSpeed: number = touch ? touchSpeed : mouseSpeed;

            // Check for time difference and apply velocity (making a sane speed adjustment)
            if (timeDelta.delta > 0) {
                velocity.current.x = speed(dx, timeDelta.seconds, eventSpeed);
                velocity.current.y = speed(dy, timeDelta.seconds, eventSpeed);
            }

            // Update the last time
            currentPos.current.time = timeDelta.now;
        };

        // Event for handling when touch or mouse event ends
        const handlePointerUp = (): void => {
            if (nodeRef.current)
                resetCursor(nodeRef.current);

            // Clear dragging flag
            isDragging.current = false;

            // Check if we should apply inertia
            if (currentPos.current) {
                const timeDelta: TimeDelta = delta(currentPos.current.time);

                // Inertia on pointer up if no natural pause (50ms)
                if (timeDelta.delta < 50)
                    applyInertia();
            }

            // Remove mouse listeners
            document.removeEventListener('mousemove', handlePointerMove);
            document.removeEventListener('mouseup', handlePointerUp);

            // Remove touch listeners
            document.removeEventListener('touchmove', handlePointerMove);
            document.removeEventListener('touchend', handlePointerUp);
        };

        // Add mouse listeners
        document.addEventListener('mousemove', handlePointerMove, { passive: true });
        document.addEventListener('mouseup', handlePointerUp, { passive: true });

        // Add touch listeners
        document.addEventListener('touchmove', handlePointerMove, { passive: true });
        document.addEventListener('touchend', handlePointerUp, { passive: true });
    }, [velocity, scrollFactor, lockX, lockY, inertia, touchSpeed, mouseSpeed, applyInertia]);

    // Handle mousedown event
    const handleMouseDown = useCallback((event: MouseEvent) => handlePointerDown(event), [handlePointerDown]);

    // Handle touchstart event
    const handleTouchStart = useCallback((event: TouchEvent) => handlePointerDown(event), [handlePointerDown]);

    // Clear the references and event listeners on node destruction
    const clearNode = useCallback((): void => {
        if (!nodeRef.current)
            return;

        // Remove listeners and clear the element
        nodeRef.current.removeEventListener('mousedown', handleMouseDown as EventListener);
        nodeRef.current.removeEventListener('touchstart', handleTouchStart as EventListener);

        nodeRef.current = null;
    }, [handleMouseDown, handleTouchStart]);

    // Set the references and event listeners on node creation
    const setScrollNode = useCallback((element: HTMLElement): void => {
        // Set the node reference and event listeners
        nodeRef.current = element;

        // Mark node for inertia
        setInertiaNode(element);

        element.addEventListener('mousedown', handleMouseDown as EventListener);
        element.addEventListener('touchstart', handleTouchStart as EventListener);
    }, [handleMouseDown, handleTouchStart, setInertiaNode]);

    // Callback ref to set the node reference
    const handleRef = useCallback((element: HTMLElement | null): void => {
        if (!element) {
            if (!nodeRef.current)
                return;

            // Remove listeners and clear the element
            clearNode();

            return;
        }

        setScrollNode(element);
    }, [clearNode, setScrollNode]);

    // Return the ref callback
    return [handleRef];
}