import React from "react";
import { Meta,  StoryFn } from '@storybook/react';
import DragScrollComponent, { DragScrollProps } from '@/stories/components/DragScrollComponent';

export default {
    title: 'useDragScroll',
    component: DragScrollComponent,
    argTypes: {
        scrollFactor: {
            control: { type: 'number' }
        },
        lockX: {
            control: { type: 'boolean' }
        },
        lockY: {
            control: { type: 'boolean' }
        },
        inertia: {
            control: { type: 'boolean' }
        },
        friction: {
            control: { type: 'number' }
        },
        touchSpeed: {
            control: { type: 'number' }
        },
        mouseSpeed: {
            control: { type: 'number' }
        }
    }
} as Meta;

const Template: StoryFn<DragScrollProps> = (args: DragScrollProps) => <DragScrollComponent {...args} />;

export const Dynamic = Template.bind({});
Dynamic.args = {
    scrollFactor: 1,
    lockX: false,
    lockY: false,
    inertia: true,
    friction: 1000,
    touchSpeed: 0.1,
    mouseSpeed: 0.05
};