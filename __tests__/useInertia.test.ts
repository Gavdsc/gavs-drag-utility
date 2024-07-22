import { renderHook,  act } from "@testing-library/react";
import useInertia from "@/hooks/useInertia";

/**
 * Unit tests to test expected outputs of the useInertia react hook
 */
describe('useInertia', (): void => {
    let mockElement: HTMLElement;
    
    // Reset before each
    beforeEach((): void => {
        // Use fake timers so we can control the animations
        jest.useFakeTimers();

        // Mocking an HTMLElement
        mockElement = document.createElement('div');
        mockElement.scrollLeft = 0;
        mockElement.scrollTop = 0;
    });
    
    // Clear after each
    afterEach((): void => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });
    
    it('should apply inertia correctly, delaying the first frame to get initial time step', (): void => {
        const { result } = renderHook(() => useInertia({ friction: .95 }));
        
        // Set the initial values and apply inertia
        act(() => {
            result.current.setInertiaNode(mockElement);
            result.current.velocity.current = { x: 100, y: 100 };
            result.current.applyInertia();
        });
        
        // Simulate first frame of animation
        act(() => jest.advanceTimersToNextTimer());

        // First animation step should not apply velocity (to set initial animation time)
        expect(result.current.velocity.current.x).toEqual(100);
        expect(result.current.velocity.current.y).toEqual(100);

        // Simulate second frame of animation
        act(() => jest.advanceTimersToNextTimer());
        
        // Second animation step should apply velocity
        expect(result.current.velocity.current.x).toBeLessThan(100);
        expect(result.current.velocity.current.y).toBeLessThan(100);
        expect(result.current.velocity.current.x).toBeGreaterThan(0);
        expect(result.current.velocity.current.y).toBeGreaterThan(0);
    })

    it('should stop applying inertia when velocity is minimal', (): void => {
        const { result } = renderHook(() => useInertia({ friction: 2 }));

        // Set initial values and apply inertia
        act(() => {
            result.current.setInertiaNode(mockElement);
            result.current.velocity.current = { x: 2, y: 2 };
            result.current.applyInertia();
        });
        
        // Simulate first frame
        act(() => jest.advanceTimersToNextTimer());
        
        // Simulate enough frames for inertia to stop 1s)
        act(() => jest.advanceTimersByTime(1000));

        // Result should be advanced to 0
        expect(result.current.velocity.current.x).toBe(0);
        expect(result.current.velocity.current.y).toBe(0);
    });

    it('should handle null and non-HTMLElement nodes correctly', (): void => {
        const { result } = renderHook(() => useInertia({ friction: 0.95 }));

        // Set inertia node to null
        act(() => {
            result.current.setInertiaNode(null);
        });
        
        // No velocity
        expect(result.current.velocity.current).toEqual({ x: 0, y: 0 });
        
        // Spy for inertia error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Not an html element
        act(() => result.current.setInertiaNode({} as HTMLElement));

        // Result in error
        expect(consoleErrorSpy).toHaveBeenCalledWith(`Inertia can't be applied to a non html element`);
        consoleErrorSpy.mockRestore();
    });
});