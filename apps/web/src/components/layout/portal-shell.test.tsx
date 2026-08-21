import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PortalShell } from './portal-shell';

describe('PortalShell', () => {
  it('renders portal identity and content', () => {
    render(<PortalShell audience="Students" title="Student home" description="Choose a campus." />);
    expect(screen.getByRole('heading', { name: 'Student home' })).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Choose a campus.')).toBeInTheDocument();
  });
});
