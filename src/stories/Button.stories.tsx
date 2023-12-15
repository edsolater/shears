import type { Meta, StoryObj } from 'storybook-solidjs'
import { Button } from '../packages/pivkit'
import { Controls } from '@storybook/blocks';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  title: 'Example/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'la' },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'solid',
  },
}
