import React from "react";
import useDragScroll from "@/hooks/useDragScroll";

export interface DragScrollProps {
    scrollFactor: number, 
    lockX: boolean,
    lockY: boolean,
    inertia: boolean,
    friction: number,
    touchSpeed: number,
    mouseSpeed: number
}

const DragScrollComponent: React.FC<DragScrollProps> = (props: DragScrollProps) => {
    const [dragRef] = useDragScroll(props);
    
    const outer: React.CSSProperties = {
        width: "350px",
        height: "350px",
        overflow: "auto",
        border: "1px solid black"
    }
    
    const inner: React.CSSProperties = {
        width: "1000px",
        height: "1000px",
        background: "linear-gradient(45deg, #6BAA6A, #fea)"
    }
    
    return (
        <div ref={dragRef} style={outer}>
            <div style={inner}></div>
        </div>
    )
}

export default DragScrollComponent;