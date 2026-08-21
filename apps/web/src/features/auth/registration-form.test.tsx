import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@/services/api-client';
import { RegistrationForm } from './registration-form';

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
  acceptSession: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('@/services/api-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/api-client')>()),
  apiClient: mocks.apiClient,
}));
vi.mock('./auth-context', () => ({ useAuth: () => ({ acceptSession: mocks.acceptSession }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }));

describe('RegistrationForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('submits the complete student registration and accepts the session', async () => {
    const session = {
      accessToken: 'access',
      user: { id: 'user-1', role: 'user' },
    };
    mocks.apiClient.mockResolvedValue(session);
    render(<RegistrationForm kind="user" />);

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Aarav Shah' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'aarav@example.com' } });
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Campus123' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Campus123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create student account' }));

    await waitFor(() => expect(mocks.acceptSession).toHaveBeenCalledWith(session));
    expect(mocks.replace).toHaveBeenCalledWith('/user');
  });

  it('renders server field validation beside the relevant input', async () => {
    mocks.apiClient.mockRejectedValue(
      new ApiClientError(422, 'VALIDATION_ERROR', 'Request validation failed', {
        fields: { phone: ['Enter a valid Indian mobile number'] },
      }),
    );
    render(<RegistrationForm kind="user" />);
    fireEvent.click(screen.getByRole('button', { name: 'Create student account' }));
    expect(await screen.findByText('Enter a valid Indian mobile number')).toBeInTheDocument();
    expect(screen.getByLabelText('Mobile number')).toHaveAttribute('aria-invalid', 'true');
  });
});
