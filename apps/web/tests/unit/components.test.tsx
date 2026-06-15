import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Basic Component Test', () => {
  it('renders a simple test div', () => {
    render(<div data-testid="test-element">Hello World</div>);
    const element = screen.getByTestId('test-element');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello World');
  });
});
