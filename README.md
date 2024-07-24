## Gav's Drag Utility

An uncontrolled drag utility hook to enable drag scrolling with inertia. The components are uncontrolled to prevent excessive re-renders.

Note: Drag and drop will be coming soon.

### Install

Just this repo at the moment, npm coming soon.

### Usage

To use the drag scroll hook, add a reference to your container for the useDragScroll callback.

```typescript jsx
const ExampleComponent: React.FC<SomeProps> = (props: SomeProps) => {
    // Instantiate the hook with reference to the outer container
    const [dragRef] = useDragScroll({ inertia: true });
    
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
```
You can find the example usage in the component used in the storybook story.

## Props

| Prop         | Type    | Default | Description                                                                               |
|--------------|---------|---------|-------------------------------------------------------------------------------------------|
| scrollFactor | number  | 1       | Optional multiplier for the scroll speed.                                                 |
| lockX        | boolean | false   | Optional scroll lock for the X axis.                                                      |
| lockY        | boolean | false   | Optional scroll lock for the Y axis.                                                      |
| inertia      | boolean | false   | Enable inertia.                                                                           |
| friction     | number  | 1000    | Friction to represent the amount of speed (inertia) to decay a second. Set nice and high. |
| touchSpeed   | number  | .1      | Micro adjustment for touch inertia (basically touch friction on initial velocity).        |
| mouseSpeed   | number  | .05     | Micro adjustment for mouse inertia (basically mouse friction on initial velocity).        |
| maxSpeed     | number  | 1200    | Maximum velocity tolerance to prevent unexpected strong arms.                             |