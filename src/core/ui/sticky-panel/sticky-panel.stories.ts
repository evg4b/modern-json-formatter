import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import { type ChildrenArgs, withContainer } from '@testing/storybook';
import './sticky-panel';
import type { StickyPanelPosition } from './sticky-panel';

interface StickyPanelArgs extends ChildrenArgs {
  position: StickyPanelPosition;
}

const meta = {
  title: 'Core/StickyPanel',
  component: 'mjf-sticky-panel',
  decorators: [withContainer({ height: '200px', border: '1px dashed #666' })],
  argTypes: {
    position: {
      control: { type: 'select' },
      options: ['rightTop', 'rightBottom', 'leftTop', 'leftBottom'] satisfies StickyPanelPosition[],
    },
  },
  args: {
    position: 'rightTop',
    children: html`
      <div style="padding: 8px; color: var(--base-text-color, #eee);">Panel content</div>
      <div style="padding: 4px 8px; color: var(--meta-info-color, #aaa); font-size: 12px;">Secondary item</div>
    `,
  },
} satisfies Meta<StickyPanelArgs>;

export default meta;
type Story = StoryObj<StickyPanelArgs>;

export const RightTop: Story = {
  args: { position: 'rightTop' },
};

export const RightBottom: Story = {
  args: { position: 'rightBottom' },
};

export const LeftTop: Story = {
  args: { position: 'leftTop' },
};

export const LeftBottom: Story = {
  args: { position: 'leftBottom' },
};
