import {
  configureAuth,
  signUpUser,
  confirmEmail,
  resendVerificationCode,
  signInWithIdentifier,
  signInWithGoogle as authClientSignInWithGoogle,
  beginPasswordReset,
  finishPasswordReset,
  getAccessToken as getRealAccessToken,
  getSignedInUser as getRealSignedInUser,
  signOutUser as realSignOutUser,
  type SignUpInputParams,
} from '@ctrlaltwin/auth-client';
import { validatePassword } from './passwordValidation';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

// --- Mock State (In-Memory Registry) ---
interface MockAccount {
  username: string;
  email: string;
  password: string;
  displayName: string;
  verified: boolean;
}

export const mockRegistry = new Map<string, MockAccount>();
export const mockEmailIndex = new Map<string, string>(); // email -> username
export const mockPendingResets = new Set<string>(); // username

export function clearMockState() {
  mockRegistry.clear();
  mockEmailIndex.clear();
  mockPendingResets.clear();
  currentMockUser = null;
  currentMockToken = null;
}

let currentMockUser: { username: string } | null = null;
let currentMockToken: string | null = null;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function initAuth() {
  if (USE_MOCK) {
    console.warn('⚠️ MOCK AUTH MODE ENABLED. This should never run in production.');
    return;
  }

  const region = import.meta.env.VITE_AWS_REGION;
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID;

  if (!region || !userPoolId || !userPoolClientId) {
    throw new Error('Missing required Cognito configuration. Check .env.local.');
  }
  
  configureAuth({
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
    userPoolDomain: import.meta.env.VITE_COGNITO_DOMAIN,
    redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN || 'http://localhost:5173/',
    redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT || 'http://localhost:5173/',
  });
}

function findMockAccount(identifier: string) {
  const lowerId = identifier.trim().toLowerCase();
  
  if (mockRegistry.has(lowerId)) {
    return mockRegistry.get(lowerId) || null;
  }
  
  if (mockEmailIndex.has(lowerId)) {
    const username = mockEmailIndex.get(lowerId)!;
    return mockRegistry.get(username) || null;
  }
  
  return null;
}

export async function signUp(input: SignUpInputParams) {
  if (USE_MOCK) {
    await delay(500);
    const username = input.username.trim().toLowerCase();
    const email = input.email.trim().toLowerCase();
    
    // Basic username validation for mock
    if (username.length < 3 || username.length > 24 || !/^[a-z][a-z0-9_]*$/.test(username)) {
      throw new Error("Invalid username format");
    }
    
    const errors = validatePassword(input.password);
    if (errors.length > 0) {
      throw new Error("Password does not meet requirements");
    }

    if (mockRegistry.has(username) || mockEmailIndex.has(email)) {
      throw new Error("Username or email already exists");
    }

    mockRegistry.set(username, {
      username,
      email,
      password: input.password,
      displayName: input.displayName,
      verified: false
    });
    mockEmailIndex.set(email, username);

    return { isSignUpComplete: false, nextStep: { signUpStep: 'CONFIRM_SIGN_UP' } };
  }
  return signUpUser(input);
}

export async function resendSignUpCode(identifier: string) {
  if (USE_MOCK) {
    await delay(500);
    const account = findMockAccount(identifier);
    if (!account) throw new Error("Incorrect username or password."); // Generic
    return { destination: account.email, deliveryMedium: 'EMAIL' };
  }
  return resendVerificationCode(identifier);
}

export async function confirmSignUpEmail(identifier: string, confirmationCode: string) {
  if (USE_MOCK) {
    await delay(500);
    const account = findMockAccount(identifier);
    if (!account) throw new Error("Incorrect username or password."); // Generic
    
    if (confirmationCode !== '123456') {
      throw new Error('Invalid code (Mock: use 123456)');
    }
    account.verified = true;
    return;
  }
  return confirmEmail({ username: identifier, confirmationCode });
}

export async function signIn(identifier: string, password: string) {
  if (USE_MOCK) {
    await delay(500);
    const account = findMockAccount(identifier);
    if (!account || account.password !== password) {
      // Generic login error
      throw new Error('Incorrect username or password.');
    }
    if (!account.verified) {
      throw new Error('User is not confirmed.');
    }
    
    currentMockUser = { username: account.username };
    currentMockToken = 'mock_jwt_token_' + account.username;
    return { isSignedIn: true, nextStep: { signInStep: 'DONE' } };
  }
  try {
    return await signInWithIdentifier(identifier, password);
  } catch (error: any) {
    if (error.name === 'UserNotFoundException' || error.name === 'NotAuthorizedException') {
       throw new Error('Incorrect username or password.');
    }
    throw error;
  }
}

export async function signInWithGoogle() {
  if (USE_MOCK) {
    throw new Error('Google Sign-In is not supported in Mock Mode');
  }
  return authClientSignInWithGoogle();
}

export async function resetPassword(identifier: string) {
  if (USE_MOCK) {
    await delay(500);
    const account = findMockAccount(identifier);
    if (account) {
      mockPendingResets.add(account.username);
    }
    // Always return success even if account doesn't exist, to prevent enumeration
    return { nextStep: { resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE' } };
  }
  return beginPasswordReset(identifier);
}

export async function confirmPasswordReset(identifier: string, code: string, newPass: string) {
  if (USE_MOCK) {
    await delay(500);
    const account = findMockAccount(identifier);
    
    // Check if account exists and has a pending reset
    if (!account || !mockPendingResets.has(account.username)) {
      throw new Error("Incorrect username or password.");
    }
    
    if (code !== '123456') {
      throw new Error('Invalid code (Mock: use 123456)');
    }
    const errors = validatePassword(newPass);
    if (errors.length > 0) {
      throw new Error("Password does not meet requirements");
    }
    account.password = newPass;
    mockPendingResets.delete(account.username);
    
    // Invalidate any active session for this user
    if (currentMockUser?.username === account.username) {
      currentMockUser = null;
      currentMockToken = null;
    }
    
    return;
  }
  return finishPasswordReset(identifier, code, newPass);
}

export async function getAccessToken() {
  if (USE_MOCK) {
    return currentMockToken;
  }
  return getRealAccessToken();
}

export async function getSignedInUser() {
  if (USE_MOCK) {
    return currentMockUser;
  }
  return getRealSignedInUser();
}

export async function signOutUser() {
  if (USE_MOCK) {
    await delay(300);
    currentMockUser = null;
    currentMockToken = null;
    return;
  }
  return realSignOutUser();
}
