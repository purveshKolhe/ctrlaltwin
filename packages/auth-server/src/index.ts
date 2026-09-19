import { CognitoJwtVerifier } from "aws-jwt-verify";
import type { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model";

export interface CognitoServerConfig {
  userPoolId: string;
  userPoolClientId: string;
}

export class AuthenticationError extends Error {
  override readonly name = "AuthenticationError";
}

export class AuthorizationError extends Error {
  override readonly name = "AuthorizationError";
}

export function parseBearerToken(header: string | undefined): string {
  if (!header) {
    throw new AuthenticationError("Authorization header is required");
  }

  const [scheme, token, extra] = header.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token || extra) {
    throw new AuthenticationError("Expected Authorization: Bearer <token>");
  }
  return token;
}

export function getGroups(payload: CognitoAccessTokenPayload): string[] {
  const groups = payload["cognito:groups"];
  return Array.isArray(groups)
    ? groups.filter((group): group is string => typeof group === "string")
    : [];
}

export function requireAnyGroup(
  payload: CognitoAccessTokenPayload,
  allowedGroups: readonly string[],
): void {
  if (allowedGroups.length === 0) return;
  const userGroups = new Set(getGroups(payload));
  if (!allowedGroups.some((group) => userGroups.has(group))) {
    throw new AuthorizationError("User does not have the required role");
  }
}

export function createAccessTokenAuthorizer(config: CognitoServerConfig) {
  if (!config.userPoolId || !config.userPoolClientId) {
    throw new Error("Cognito user pool ID and client ID are required");
  }

  const verifier = CognitoJwtVerifier.create({
    userPoolId: config.userPoolId,
    tokenUse: "access",
    clientId: config.userPoolClientId,
  });

  return async function authorize(
    authorizationHeader: string | undefined,
    allowedGroups: readonly string[] = [],
  ): Promise<CognitoAccessTokenPayload> {
    const token = parseBearerToken(authorizationHeader);
    try {
      const payload = await verifier.verify(token);
      requireAnyGroup(payload, allowedGroups);
      return payload;
    } catch (error) {
      if (error instanceof AuthorizationError) throw error;
      throw new AuthenticationError("Access token is invalid or expired");
    }
  };
}
