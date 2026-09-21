import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.stubEnv('VITE_USE_MOCK_AUTH', 'false');

import * as authClient from '@ctrlaltwin/auth-client';
import * as amplifyAuth from 'aws-amplify/auth';

// Mock aws-amplify/auth
vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: vi.fn(),
  fetchUserAttributes: vi.fn(),
}));

// Mock the authClient module so we don't make real network calls
vi.mock('@ctrlaltwin/auth-client', async (importOriginal) => {
  const actual = await importOriginal() as typeof authClient;
  return {
    ...actual,
    signInWithGoogle: vi.fn(),
    getSignedInUser: vi.fn(),
  };
});

// Dynamic import inside tests prevents hoisting
let signInWithGoogle: any;
let getSignedInUser: any;

describe('authService real mode (OAuth)', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubEnv('VITE_USE_MOCK_AUTH', 'false');
    const authService = await import('./authService');
    signInWithGoogle = authService.signInWithGoogle;
    getSignedInUser = authService.getSignedInUser;
  });

  it('proves missing OAuth configuration does not expose the raw internal error', async () => {
    // Missing domain configuration
    vi.stubEnv('VITE_COGNITO_DOMAIN', '');

    await expect(signInWithGoogle()).rejects.toThrow('Google sign-in is temporarily unavailable. Please try again.');

    // Developer should see the real reason
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Missing VITE_COGNITO_DOMAIN')
    );
  });

  it('proves the generic Google error is displayed when underlying initiation fails', async () => {
    // Given correct configuration
    vi.stubEnv('VITE_COGNITO_DOMAIN', 'ctrlaltwin-auth-756160874506-eu-north-1.auth.eu-north-1.amazoncognito.com');

    // And an underlying failure from Amplify (like oauth param not configured)
    vi.mocked(authClient.signInWithGoogle).mockRejectedValue(new Error('oauth param not configured'));

    await expect(signInWithGoogle()).rejects.toThrow('Google sign-in is temporarily unavailable. Please try again.');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Google Sign-In initiation failed:',
      expect.any(Error)
    );
  });

  describe('getSignedInUser display name resolution', () => {
    beforeEach(() => {
      vi.mocked(authClient.getSignedInUser).mockResolvedValue({ username: 'google_123', userId: 'user-123' });
    });

    it('ID token name returns the Google display name', async () => {
      vi.mocked(amplifyAuth.fetchAuthSession).mockResolvedValue({
        tokens: { idToken: { payload: { name: 'Token Name' } } } as any
      });
      const user = await getSignedInUser();
      expect(user.displayName).toBe('Token Name');
    });

    it('given_name fallback works', async () => {
      vi.mocked(amplifyAuth.fetchAuthSession).mockResolvedValue({
        tokens: { idToken: { payload: { given_name: 'Given Name' } } } as any
      });
      const user = await getSignedInUser();
      expect(user.displayName).toBe('Given Name');
    });

    it('failure of fetchUserAttributes does not replace a valid ID-token name', async () => {
      vi.mocked(amplifyAuth.fetchAuthSession).mockResolvedValue({
        tokens: { idToken: { payload: { name: 'Token Name' } } } as any
      });
      vi.mocked(amplifyAuth.fetchUserAttributes).mockRejectedValue(new Error('No scope'));
      const user = await getSignedInUser();
      expect(user.displayName).toBe('Token Name');
    });

    it('username is used only when no safe display-name claim exists', async () => {
      vi.mocked(amplifyAuth.fetchAuthSession).mockRejectedValue(new Error('Failed session'));
      vi.mocked(amplifyAuth.fetchUserAttributes).mockRejectedValue(new Error('No scope'));
      const user = await getSignedInUser();
      expect(user.displayName).toBe('google_123');
    });
  });
});
