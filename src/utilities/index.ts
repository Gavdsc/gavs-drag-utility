/**
 * Get the speed travelling with adjustment variable for devices.
 * @param distance - The distance travelled.
 * @param time - The time it took in seconds.
 * @param adjustment - Adjustment to the speed.
 */
const speed = (distance: number, time: number, adjustment: number): number => {
    // Guard against division by 0
    if (time === 0)
        return 0;

    // Adjust and return the speed
    return (distance / time) * adjustment;
}

/**
 * Get the distance travelled adjusted by a factor (e.g. scroll factor).
 * @param previous - The previous position.
 * @param current - The current position.
 * @param factor - Factor to adjust by.
 */
const distance = (previous: number, current: number, factor: number): number => (current - previous) * factor;

/**
 * A type to hold time delta information
 */
export type TimeDelta = {
    previous: number,
    now: number,
    delta: number,
    seconds: number
}

/**
 * Calculate the time delta between a past event and the present.
 * @param previous - The past event to measure against.
 */
const delta = (previous: number): TimeDelta => {
    // Get now (time) & adjust delta
    const now: number = Date.now();
    const delta: number = now - previous;
    const seconds: number = delta / 1000;

    return { previous, now, delta, seconds };
};

/**
 * Decay speed based on friction (speed reduction) per second.
 * @param speed - The current speed travelling.
 * @param delta - The current time delta in seconds.
 * @param friction - The friction to reduce the speed by per second.
 */
const decay = (speed: number, delta: number, friction: number): number => {
    // The direction travelling (positive or negative)
    const direction: number = Math.sign(speed);

    // The speed to scrub, adjusting friction by delta
    const scrub: number = friction * delta;

    // The new speed after applying a scrub
    const newSpeed: number = Math.abs(speed) - scrub;

    // Ensure speed doesn't go negative
    if (newSpeed <= 0)
        return 0;

    // Adjust value for direction
    return direction === 1 ? newSpeed : -newSpeed;
}

/**
 * Apply a maximum tolerance to the velocity.
 * @param velocity - The velocity to apply the tolerance to.
 * @param tolerance - The tolerance to apply.
 */
const applyVelocityTolerance = (velocity: number, tolerance: number): number => {
    // Ensure that tolerance is positive
    tolerance = Math.abs(tolerance);
    
    // Check for negatives and then get the absolute value of the velocity
    const negative: boolean = velocity < 0;
    const absolute: number = Math.abs(velocity);

    // Check against tolerance and return the constrained velocity.
    velocity = absolute > tolerance ? tolerance : absolute;

    return negative ? -velocity : velocity;
}

export { speed, distance, delta, decay, applyVelocityTolerance };