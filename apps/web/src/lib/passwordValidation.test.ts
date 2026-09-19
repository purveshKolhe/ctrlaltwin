import { describe, it, expect } from 'vitest';
import { validatePassword } from './passwordValidation';

describe('validatePassword', () => {
  it('passes for a valid password', () => {
    const errors = validatePassword('Test@123');
    expect(errors).toHaveLength(0);
  });

  it('fails if password is too short (7 chars)', () => {
    const errors = validatePassword('Tst@123');
    expect(errors).toContain('Password must be at least 8 characters');
  });

  it('fails if missing uppercase', () => {
    const errors = validatePassword('test@123');
    expect(errors).toContain('Password must contain at least one uppercase letter');
  });

  it('fails if missing lowercase', () => {
    const errors = validatePassword('TEST@123');
    expect(errors).toContain('Password must contain at least one lowercase letter');
  });

  it('fails if missing number', () => {
    const errors = validatePassword('Test@abc');
    expect(errors).toContain('Password must contain at least one number');
  });

  it('fails if missing special character', () => {
    const errors = validatePassword('Test1234');
    expect(errors).toContain('Password must contain at least one special character');
  });
});
