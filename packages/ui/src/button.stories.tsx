import type { Meta, StoryObj } from '@storybook/react';

const Button = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    style={{ 
      padding: '10px 20px', 
      borderRadius: '8px', 
      background: 'linear-gradient(to right, #34d399, #06b6d4)', 
      color: 'white',
      border: 'none',
      cursor: 'pointer'
    }}
  >
    {children}
  </button>
);

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Action Button',
  },
};
