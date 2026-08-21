import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from './auth-guard';

const mocks = vi.hoisted(() => ({ replace: vi.fn(), useAuth: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock('./auth-context', () => ({ useAuth: mocks.useAuth }));

describe('AuthGuard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders content for the matching role', () => {
    mocks.useAuth.mockReturnValue({ status: 'authenticated', user: { role: 'seller' } });
    render(<AuthGuard role="seller"><p>Seller dashboard</p></AuthGuard>);
    expect(screen.getByText('Seller dashboard')).toBeInTheDocument();
  });

  it('redirects a signed-in user away from another role portal', async () => {
    mocks.useAuth.mockReturnValue({ status: 'authenticated', user: { role: 'user' } });
    render(<AuthGuard role="admin"><p>Admin dashboard</p></AuthGuard>);
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/user'));
    expect(screen.queryByText('Admin dashboard')).not.toBeInTheDocument();
  });
});
