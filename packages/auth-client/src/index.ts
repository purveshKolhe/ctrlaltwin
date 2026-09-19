import { Amplify } from "aws-amplify";
import {
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  resetPassword,
  resendSignUpCode,
  signIn,
  signInWithRedirect,
  signOut,
  signUp,
  type ConfirmSignUpInput,
  type ResendSignUpCodeOutput,
  type ResetPasswordOutput,
  type SignInOutput,
  type SignUpOutput,
} from "aws-amplify/auth";

export interface CognitoClientConfig {
  region: string;
  userPoolId: string;
  userPoolClientId: string;
  userPoolDomain?: string;
  redirectSignIn?: string;
  redirectSignOut?: string;
}

export interface SignUpInputParams {
  username: string;
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

  const amplifyConfig: any = {
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId,
        userPoolClientId: config.userPoolClientId,
        signUpVerificationMethod: "code",
      },
    },
  };

  if (config.userPoolDomain && config.redirectSignIn && config.redirectSignOut) {
    amplifyConfig.Auth.Cognito.loginWith = {
      oauth: {
        domain: config.userPoolDomain,
        scopes: ["openid", "email", "profile"],
        redirectSignIn: [config.redirectSignIn],
        redirectSignOut: [config.redirectSignOut],
        responseType: "code",
      },
    };
  }

  Amplify.configure(amplifyConfig);
  configured = true;
}

function assertConfigured(): void {
  if (!configured) {
    throw new Error("Call configureAuth before using authentication functions");
  }
}

export async function signUpUser(
  input: SignUpInputParams,
): Promise<SignUpOutput> {
  assertConfigured();
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();

  return signUp({
    username,
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

export async function signInWithIdentifier(
  identifier: string,
  password: string,
): Promise<SignInOutput> {
  assertConfigured();
  return signIn({ username: identifier.trim().toLowerCase(), password });
}

export async function signInWithGoogle(): Promise<void> {
  assertConfigured();
  return signInWithRedirect({ provider: "Google" });
}

export async function beginPasswordReset(
  identifier: string,
): Promise<ResetPasswordOutput> {
  assertConfigured();
  return resetPassword({ username: identifier.trim().toLowerCase() });
}

export async function finishPasswordReset(
  identifier: string,
  confirmationCode: string,
  newPassword: string,
): Promise<void> {
  assertConfigured();
  await confirmResetPassword({
    username: identifier.trim().toLowerCase(),
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

export async function resendVerificationCode(
  identifier: string,
): Promise<ResendSignUpCodeOutput> {
  assertConfigured();
  return resendSignUpCode({ username: identifier.trim().toLowerCase() });
}
