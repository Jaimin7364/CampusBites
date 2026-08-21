import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OutletForm } from './outlet-form';

const mocks = vi.hoisted(() => ({ listActiveUniversities: vi.fn(), uploadOutletImage: vi.fn() }));
vi.mock('@/services/university-service', () => ({ listActiveUniversities: mocks.listActiveUniversities }));
vi.mock('@/services/hotel-service', () => ({ uploadOutletImage: mocks.uploadOutletImage, outletImageUrl: (path: string) => path }));

describe('OutletForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listActiveUniversities.mockResolvedValue({ universities: [{ id: 'university-1', name: 'GTU', city: 'Ahmedabad' }], pagination: {} });
  });

  it('uploads and previews a valid outlet image', async () => {
    mocks.uploadOutletImage.mockResolvedValue({ url: '/uploads/outlets/image.webp' });
    render(<OutletForm onSubmit={vi.fn()} />);
    await screen.findByRole('option', { name: 'GTU — Ahmedabad' });
    const file = new File(['webp-image'], 'outlet.webp', { type: 'image/webp' });
    fireEvent.change(screen.getByLabelText('Main outlet image'), { target: { files: [file] } });
    await waitFor(() => expect(mocks.uploadOutletImage).toHaveBeenCalledWith(file));
    expect(await screen.findByAltText('Outlet preview')).toHaveAttribute('src', '/uploads/outlets/image.webp');
  });

  it('rejects an oversized image before making an API request', async () => {
    render(<OutletForm onSubmit={vi.fn()} />);
    await screen.findByRole('option', { name: 'GTU — Ahmedabad' });
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Main outlet image'), { target: { files: [file] } });
    expect(await screen.findByText('Image must be 5 MB or smaller.')).toBeInTheDocument();
    expect(mocks.uploadOutletImage).not.toHaveBeenCalled();
  });
});
