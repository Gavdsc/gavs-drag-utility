import { renderHook,  act } from "@testing-library/react";
import useInertia from "@/hooks/useInertia";
import useDragScroll from "@/hooks/useDragScroll";

// Mock useInertia hook with initial velocity
jest.mock('@/hooks/useInertia', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        setInertiaNode: jest.fn(),
        velocity: { current: { x: 0, y: 0 } },
        applyInertia: jest.fn(),
    }))
}));

/**
 * Unit tests to test expected outputs of the useDragScroll react hook
 */
describe('useDragScroll', (): void => {
    let mockElement: HTMLElement;
    let addEventListener: jest.Mock;
    let removeEventListener: jest.Mock;
    
    beforeEach(() => {
       // Mock the addEventListener and removeEventListener functions
       addEventListener = jest.fn();
       removeEventListener = jest.fn();
       
       // Mock HTMLElement
       mockElement = document.createElement('div');
       mockElement.scrollLeft = 0;
       mockElement.scrollTop = 0;
       mockElement.addEventListener = addEventListener;
       mockElement.removeEventListener = removeEventListener;
       mockElement.style.cursor = '';
       mockElement.style.userSelect = '';
    });
    
    afterEach((): void => {
       jest.clearAllMocks();
       jest.useRealTimers();
    });

    /**
     * Simulate a mouse down event at position x: 100, y: 100
     */
    const simulateDownEvent = (): void => {
       // Retrieve the mousedown event listener from the mock element
       const handleMouseDown: EventListener = addEventListener.mock.calls.find((call: any) => call[0] === 'mousedown')[1];
    
       // Create a mock mouse down event
       const mockDownEvent: MouseEvent = new MouseEvent('mousedown', { clientX: 100, clientY: 100 });
    
       // Expect to return a function so we can fire the mouse event
       expect(typeof handleMouseDown).toBe('function');
    
       // Fire the mouse down event
       act(() => handleMouseDown(mockDownEvent));
    };

    /**
     * Simulate a mouse up event
     */
    const simulateUpEvent = (): void => {
       // Mock mouse up and dispatch against the document
       const mockUpEvent: MouseEvent = new MouseEvent('mouseup');
       act(() => document.dispatchEvent(mockUpEvent));
    }

    /**
     * Simulate a movement event of x: 150, y: 150
     * @param executeOver - The time to execute the event over
     */
    const simulateMoveEvent = (executeOver: number = 0): void => {
        // Create a new mousemove event globally, to imitate dragging
        const mockMoveEvent: MouseEvent = new MouseEvent('mousemove', {
            clientX: 150,
            clientY: 150
        });
        
        // Simulation event duration
        if (executeOver > 0)
            act(() => jest.advanceTimersByTime(executeOver));

        // Dispatch move event
        act(() => document.dispatchEvent(mockMoveEvent));
    }

    it('should set listeners correctly', (): void => {
        const { result } = renderHook(() => useDragScroll());
        
        // Set mock element
        act(() => result.current[0](mockElement));
        
        // Expect event listeners to fire
        expect(mockElement.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(mockElement.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });

    it('should handle pointer down', (): void => {
        const { result } = renderHook(() => useDragScroll());
        
        // Apply hook to mock element and fire events
        act(() => result.current[0](mockElement));
        simulateDownEvent();
        
        // Check cursor has been changed
        expect(mockElement.style.cursor).toBe('grabbing');
        expect(mockElement.style.userSelect).toBe('none');
    });
 
    it('should handle pointer up', (): void => {
        const { result } = renderHook(() => useDragScroll());

        // Apply hook to mock element and fire events
        act(() => result.current[0](mockElement));
        simulateDownEvent();
        simulateUpEvent();
        
        // Check cursor has been changed
        expect(mockElement.style.cursor).toBe('grab');
        expect(mockElement.style.userSelect).toBe('');
    });

    it('should update position based on drag', (): void => {
        const { result } = renderHook(() => useDragScroll());

        // Apply hook to mock element and fire events
        act(() => result.current[0](mockElement));
        simulateDownEvent();
        simulateMoveEvent(0);
        
        // initial - current
        expect(mockElement.scrollLeft).toBe(-50);
        expect(mockElement.scrollTop).toBe(-50);
    });

    it('should update velocity', (): void => {
        // Enable fake timers
        jest.useFakeTimers();
        
        const { result } = renderHook(() => useDragScroll({ 
            inertia: true, 
            // Set mouse friction to 1 for constant speed
            mouseSpeed: 1 
        }));

        // Apply hook to mock element and fire events
        act(() => result.current[0](mockElement));
        simulateDownEvent();
        simulateMoveEvent(1000);

        const { velocity } = (useInertia as jest.Mock).mock.results[0].value;
        
        // Movement of 50pps 
        expect(velocity.current.x).toBe(50);
        expect(velocity.current.y).toBe(50);
    });

    it('should apply inertia', (): void => {
        // Enable fake timers
        jest.useFakeTimers();

        const { result } = renderHook(() => useDragScroll({
            inertia: true,
            // Set mouse friction to 1 for constant speed
            mouseSpeed: 1
        }));

        // Apply hook to mock element and fire events
        act(() => result.current[0](mockElement));
        simulateDownEvent();
        simulateMoveEvent(1000);
        simulateUpEvent();

        // Verify that applyInertia was called
        const { applyInertia } = (useInertia as jest.Mock).mock.results[0].value;
        
        // Check applied inertia is called
        expect(applyInertia).toHaveBeenCalled();
    });

    it('should apply lock on x and y axis', (): void => {
        const { result } = renderHook(() => useDragScroll({ lockX: true, lockY: true }));

        // Apply hook to mock element and fire events
        act(() => result.current[0](mockElement));
        simulateDownEvent();
        simulateMoveEvent(0);

        // No scroll, expect initial value
        expect(mockElement.scrollLeft).toBe(0);
        expect(mockElement.scrollTop).toBe(0);
    });
});