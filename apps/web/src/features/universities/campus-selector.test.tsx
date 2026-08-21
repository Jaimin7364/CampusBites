import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CampusSelector, SELECTED_CAMPUS_KEY } from './campus-selector';

const mocks = vi.hoisted(() => ({ listActiveUniversities: vi.fn() }));
vi.mock('@/services/university-service', () => ({
  listActiveUniversities: mocks.listActiveUniversities,
}));

const campus = {
  id: 'campus-1',
  name: 'Gujarat Technological University',
  city: 'Ahmedabad',
  state: 'Gujarat',
  active: true,
  createdAt: '2026-08-21T00:00:00.000Z',
  updatedAt: '2026-08-21T00:00:00.000Z',
};

describe('CampusSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mocks.listActiveUniversities.mockResolvedValue({
      universities: [campus],
      pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });
  });

  it('persists a selected active campus and allows changing it', async () => {
    render(<CampusSelector />);
    fireEvent.change(await screen.findByLabelText('Campus'), { target: { value: campus.id } });
    fireEvent.click(screen.getByRole('button', { name: 'Use this campus' }));

    expect(screen.getByRole('heading', { name: campus.name })).toBeInTheDocument();
    expect(window.localStorage.getItem(SELECTED_CAMPUS_KEY)).toBe(campus.id);

    fireEvent.click(screen.getByRole('button', { name: 'Change campus' }));
    expect(window.localStorage.getItem(SELECTED_CAMPUS_KEY)).toBeNull();
    expect(screen.getByRole('heading', { name: 'Choose your campus' })).toBeInTheDocument();
  });

  it('removes a saved campus that is no longer active', async () => {
    window.localStorage.setItem(SELECTED_CAMPUS_KEY, 'inactive-campus');
    render(<CampusSelector />);

    expect(await screen.findByText(/previous campus is no longer available/i)).toBeInTheDocument();
    await waitFor(() => expect(window.localStorage.getItem(SELECTED_CAMPUS_KEY)).toBeNull());
  });
});
