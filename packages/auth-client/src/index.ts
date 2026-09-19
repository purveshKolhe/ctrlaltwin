import { Amplify } from "aws-amplify";
import {
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
  signUp,
  type ConfirmSignUpInput,
  type ResetPasswordOutput,
  type SignInOutput,
  type SignUpOutput,
} from "aws-amplify/auth";

export interface CognitoClientConfig {
  region: string;
  userPoolId: string;
  userPoolClientId: string;
}

export interface SignUpWithEmailInput {
  email: string;
  password: string;
  displayName: string;
}

let configured = false;

/** Configure Amplify once near the root of the React application. */
export function configureAuth(config: CognitoClientConfig): void {
  if (!config.region || !config.userPoolId || !config.userPoolClientId) {
    throw new Error("Cognito region, user pool ID, and client ID are required");
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId,
        userPoolClientId: config.userPoolClientId,
        signUpVerificationMethod: "code",
      },
    },
  });
  configured = true;
}

function assertConfigured(): void {
  if (!configured) {
    throw new Error("Call configureAuth before using authentication functions");
  }
}

export async function signUpWithEmail(
  input: SignUpWithEmailInput,
): Promise<SignUpOutput> {
  assertConfigured();
  const email = input.email.trim().toLowerCase();

  return signUp({
    username: email,
    password: input.password,
    options: {
      userAttributes: {
        email,
        name: input.displayName.trim(),
      },
    },
  });
}

export async function confirmEmail(
  input: Pick<ConfirmSignUpInput, "username" | "confirmationCode">,
): Promise<void> {
  assertConfigured();
  await confirmSignUp({
    username: input.username.trim().toLowerCase(),
    confirmationCode: input.confirmationCode.trim(),
  });
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<SignInOutput> {
  assertConfigured();
  return signIn({ username: email.trim().toLowerCase(), password });
}

export async function beginPasswordReset(
  email: string,
): Promise<ResetPasswordOutput> {
  assertConfigured();
  return resetPassword({ username: email.trim().toLowerCase() });
}

export async function finishPasswordReset(
  email: string,
  confirmationCode: string,
  newPassword: string,
): Promise<void> {
  assertConfigured();
  await confirmResetPassword({
    username: email.trim().toLowerCase(),
    confirmationCode: confirmationCode.trim(),
    newPassword,
  });
}

export async function getAccessToken(): Promise<string | null> {
  assertConfigured();
  const session = await fetchAuthSession();
  return session.tokens?.accessToken.toString() ?? null;
}

export async function getSignedInUser() {
  assertConfigured();
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function signOutUser(): Promise<void> {
  assertConfigured();
  await signOut();
}
