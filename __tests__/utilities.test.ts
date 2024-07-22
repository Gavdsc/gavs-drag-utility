import { speed, distance, delta, decay, TimeDelta } from '@/utilities';

describe('Utility functions', () => {
    describe('speed', () => {
        it('should return 0 if time is 0 to guard against division by 0', (): void => {
            expect(speed(100, 0, 1)).toBe(0);
        });

        it('should calculate the speed correctly', () => {
            // (100 / 2) * 1
            expect(speed(100, 2, 1)).toBe(50);
            // (100 / 2) * 0.5
            expect(speed(100, 2, 0.5)).toBe(25); 
        });
    });

    describe('distance', (): void => {
        it('should calculate the distance correctly', (): void => {
            // (100 - 0) * 1
            expect(distance(0, 100, 1)).toBe(100);
            // (100 - 0) * 0.5
            expect(distance(0, 100, 0.5)).toBe(50);
            // (200 - 100) * 2
            expect(distance(100, 200, 2)).toBe(200); 
        });
    });

    describe('delta', (): void => {
        it('should calculate the time delta correctly', (): void => {
            const now = Date.now();
            const previous = now - 1000; // 1 second before
            const result: TimeDelta = delta(previous);

            expect(result.previous).toBe(previous);
            expect(result.now).toBeGreaterThanOrEqual(now);
            expect(result.delta).toBeGreaterThanOrEqual(1000);
            expect(result.seconds).toBeGreaterThanOrEqual(1);
        });
    });

    describe('decay', (): void => {
        it('should apply decay to the speed correctly', (): void => {
            // 100 - (1 * .1) = 99.9
            expect(decay(100, 1, .1)).toBe(99.9);
            // -100 + (1 * .1) = -99.9
            expect(decay(-100, 1, .1)).toBe(-99.9);
            // 100 - (1 * 50) = 99
            expect(decay(100, 1, 50)).toBe(50);
            // -100 + (1 * 50) = -99
            expect(decay(-100, 1, 50)).toBe(-50);
            // 100 - (.5 * .5) = 99.5
            expect(decay(100, .5, .5)).toBe(99.75);
            // -100 + (.5 * .5) = -99.5
            expect(decay(-100, .5, .5)).toBe(-99.75);
        });

        it('should return speed as 0', (): void => {
            // 0 - (1 * .5) = 0
            expect(decay(0, 1, 0.5)).toBe(0);
            // 0 - (1 * 1) = 0
            expect(decay(0, 1, 1)).toBe(0);
        });

        it('should return speed as 0 when scrub exceeds speed', (): void => {
            // 1 - (1 * 2) = 0 (speed should not go negative)
            expect(decay(1, 1, 2)).toBe(0);
            // -1 + (2 * 1) = 0 (speed should not go positive)
            expect(decay(-1, 1, 2)).toBe(0);
        });
        
        it('should work with larger values', (): void => {
            // 10000 - (10 * 100)
            expect(decay(10000, 10, 100)).toBe(9000);
            // -9000 - (10 * 100)
            expect(decay(-10000, 10, 100)).toBe(-9000);
            // 1000000 - (10 * 100000)
            expect(decay(1000000, 10, 100000)).toBe(0);
            // -1000000 - (10 * 100000)
            expect(decay(-1000000, 10, 100000)).toBe(0);
            // 1000000000 - (10 * 100000000)
            expect(decay(1000000000, 10, 100000000)).toBe(0);
            // -1000000000 - (10 * 100000000)
            expect(decay(-1000000000, 10, 100000000)).toBe(0);           
        });
    });
});