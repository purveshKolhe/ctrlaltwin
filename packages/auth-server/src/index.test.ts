import assert from "node:assert/strict";
import test from "node:test";
import type { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model";
import {
  AuthenticationError,
  AuthorizationError,
  parseBearerToken,
  requireAnyGroup,
} from "./index.js";

test("parseBearerToken accepts a well-formed bearer token", () => {
  assert.equal(parseBearerToken("Bearer abc.def.ghi"), "abc.def.ghi");
});

test("parseBearerToken rejects malformed authorization headers", () => {
  assert.throws(() => parseBearerToken(undefined), AuthenticationError);
  assert.throws(() => parseBearerToken("Basic secret"), AuthenticationError);
  assert.throws(
    () => parseBearerToken("Bearer token unexpected"),
    AuthenticationError,
  );
});

test("requireAnyGroup permits users in an allowed Cognito group", () => {
  const payload = { "cognito:groups": ["user", "admin"] } as unknown as CognitoAccessTokenPayload;
  assert.doesNotThrow(() => requireAnyGroup(payload, ["admin"]));
});

test("requireAnyGroup rejects users without an allowed group", () => {
  const payload = { "cognito:groups": ["user"] } as unknown as CognitoAccessTokenPayload;
  assert.throws(() => requireAnyGroup(payload, ["admin"]), AuthorizationError);
});
