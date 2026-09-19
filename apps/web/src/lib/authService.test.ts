import { describe, it, expect, beforeEach, vi } from 'vitest';
vi.stubEnv('VITE_USE_MOCK_AUTH', 'true');
import { signUp, signIn, resetPassword, confirmPasswordReset, clearMockState, mockRegistry } from './authService';

describe('authService mock mode', () => {
  beforeEach(() => {
    // Ensure we are in a clean state before each test
    clearMockState();
  });

  it('resolves account with canonical username and email', async () => {
    await signUp({
      username: 'TestUser',
      email: 'Test@Example.com',
      password: 'Password@123',
      displayName: 'Test User'
    });
    
    // Manually verify so we can log in
    const account = mockRegistry.get('testuser');
    expect(account).toBeDefined();
    if (account) account.verified = true;

    // Login with canonical username
    const result1 = await signIn(' testUSER ', 'Password@123');
    expect(result1.isSignedIn).toBe(true);

    // Login with canonical email
    const result2 = await signIn('  test@EXAMPLE.com ', 'Password@123');
    expect(result2.isSignedIn).toBe(true);
  });

  it('supports password reset using username or email and updates correctly', async () => {
    await signUp({
      username: 'userA',
      email: 'usera@test.com',
      password: 'OldPassword@123',
      displayName: 'User A'
    });
    
    const account = mockRegistry.get('usera');
    if (account) account.verified = true;

    // Request reset via email
    await resetPassword('usera@test.com');
    
    // Confirm reset using username
    await confirmPasswordReset('usera', '123456', 'NewPassword@123');

    // Old password should fail
    await expect(signIn('usera', 'OldPassword@123')).rejects.toThrow();

    // New password should succeed
    const result = await signIn('usera@test.com', 'NewPassword@123');
    expect(result.isSignedIn).toBe(true);
  });

  it('keeps independent accounts isolated during reset', async () => {
    await signUp({ username: 'userA', email: 'a@test.com', password: 'PasswordA@123', displayName: 'A' });
    await signUp({ username: 'userB', email: 'b@test.com', password: 'PasswordB@123', displayName: 'B' });

    const accA = mockRegistry.get('usera');
    const accB = mockRegistry.get('userb');
    if (accA) accA.verified = true;
    if (accB) accB.verified = true;

    // Reset A
    await resetPassword('userA');
    await confirmPasswordReset('userA', '123456', 'NewPasswordA@123');

    // A's old password fails, new succeeds
    await expect(signIn('usera', 'PasswordA@123')).rejects.toThrow();
    await expect(signIn('usera', 'NewPasswordA@123')).resolves.toBeDefined();

    // B's password remains unchanged
    await expect(signIn('userb', 'PasswordB@123')).resolves.toBeDefined();
  });
});
