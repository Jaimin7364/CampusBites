import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UniversityManager } from './university-manager';

const mocks = vi.hoisted(() => ({
  listAdminUniversities: vi.fn(),
  createUniversity: vi.fn(),
  updateUniversity: vi.fn(),
  setUniversityStatus: vi.fn(),
  deleteUniversity: vi.fn(),
}));
vi.mock('@/services/university-service', () => mocks);

const campus = {
  id: 'campus-1',
  name: 'Gujarat Technological University',
  city: 'Ahmedabad',
  state: 'Gujarat',
  active: true,
  createdAt: '2026-08-21T00:00:00.000Z',
  updatedAt: '2026-08-21T00:00:00.000Z',
};

describe('UniversityManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listAdminUniversities.mockResolvedValue({
      universities: [campus],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it('creates a university through the admin API', async () => {
    mocks.createUniversity.mockResolvedValue({ university: campus });
    render(<UniversityManager />);
    await screen.findByText(campus.name);
    fireEvent.click(screen.getByRole('button', { name: 'Add university' }));
    fireEvent.change(screen.getByLabelText('University name'), { target: { value: 'New University' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Surat' } });
    fireEvent.change(screen.getByLabelText('State (optional)'), { target: { value: 'Gujarat' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create university' }));

    await waitFor(() => expect(mocks.createUniversity).toHaveBeenCalledWith({
      name: 'New University', city: 'Surat', state: 'Gujarat', active: true,
    }));
    expect(await screen.findByText('University created successfully.')).toBeInTheDocument();
  });

  it('deactivates an active university', async () => {
    mocks.setUniversityStatus.mockResolvedValue({ university: { ...campus, active: false } });
    render(<UniversityManager />);
    fireEvent.click(await screen.findByRole('button', { name: 'Deactivate' }));
    await waitFor(() => expect(mocks.setUniversityStatus).toHaveBeenCalledWith(campus.id, false));
    expect(await screen.findByText(`${campus.name} deactivated.`)).toBeInTheDocument();
  });
});
