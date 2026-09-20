import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './post-authentication.js';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

vi.mock('@aws-sdk/lib-dynamodb', () => {
  const UpdateCommand = vi.fn();
  const DynamoDBDocumentClient = {
    from: vi.fn(() => ({
      send: vi.fn().mockResolvedValue({}),
    })),
  };
  return { DynamoDBDocumentClient, UpdateCommand };
});

describe('post-authentication lambda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockEvent = (overrides = {}) => ({
    version: '1',
    region: 'eu-north-1',
    userPoolId: 'eu-north-1_test',
    userName: 'testuser',
    callerContext: { awsSdkVersion: 'aws-sdk-js-2.1083.0', clientId: 'testclient' },
    request: {
      userAttributes: {
        sub: '1234-5678',
        email: 'test@example.com',
        name: 'Test User',
      },
      newDeviceUsed: false,
    },
    response: {},
    ...overrides,
  });

  it('handles native Cognito Post Authentication event correctly', async () => {
    const event = createMockEvent() as any;
    const result = await handler(event, {} as any, () => {});

    expect(result).toBe(event);

    // Check DynamoDB UpdateCommand parameters
    expect(UpdateCommand).toHaveBeenCalledTimes(1);
    const updateCall = vi.mocked(UpdateCommand).mock.calls[0]?.[0] as any;

    expect(updateCall.Key).toEqual({ userId: '1234-5678' });
    expect(updateCall.ExpressionAttributeValues?.[':authProvider']).toBe('cognito');
    expect(updateCall.ExpressionAttributeValues?.[':username']).toBe('testuser');
    expect(updateCall.ExpressionAttributeValues?.[':email']).toBe('test@example.com');
    expect(updateCall.UpdateExpression).not.toContain("#userId");
    expect(updateCall.ExpressionAttributeNames?.["#userId"]).toBeUndefined();
    expect(updateCall.ExpressionAttributeValues?.[":userId"]).toBeUndefined();
    expect(updateCall.UpdateExpression).toContain('if_not_exists(#authProvider, :authProvider)');
    expect(updateCall.UpdateExpression).toContain('if_not_exists(#username, :username)');
    expect(updateCall.UpdateExpression).toContain('if_not_exists(#createdAt, :createdAt)');
  });

  it('handles Google Post Authentication event correctly', async () => {
    const event = createMockEvent({
      userName: 'Google_1234',
      request: {
        userAttributes: {
          sub: 'google-sub-123',
          email: 'google@example.com',
          name: 'Google User',
          identities: JSON.stringify([{ providerName: 'Google', providerType: 'Google', issuer: null, primary: 'true', dateCreated: '123' }])
        }
      }
    }) as any;

    await handler(event, {} as any, () => {});

    expect(UpdateCommand).toHaveBeenCalledTimes(1);
    const updateCall = vi.mocked(UpdateCommand).mock.calls[0]?.[0] as any;

    expect(updateCall.Key).toEqual({ userId: 'google-sub-123' });
    expect(updateCall.ExpressionAttributeValues?.[':authProvider']).toBe('google');
    expect(updateCall.ExpressionAttributeValues?.[':username']).toBe('google_google-sub-123');
    expect(updateCall.ExpressionAttributeValues?.[':email']).toBe('google@example.com');
  });

  it('fails safely if required sub is missing', async () => {
    const event = createMockEvent({
      request: {
        userAttributes: {
          email: 'test@example.com'
        }
      }
    }) as any;

    await expect(handler(event, {} as any, () => {})).rejects.toThrow('Missing sub attribute');
    expect(UpdateCommand).not.toHaveBeenCalled();
  });

  it('repeated authentication targets the same sub key', async () => {
    const event = createMockEvent() as any;

    await handler(event, {} as any, () => {});
    await handler(event, {} as any, () => {});

    expect(UpdateCommand).toHaveBeenCalledTimes(2);
    const firstCall = vi.mocked(UpdateCommand).mock.calls[0]?.[0] as any;
    const secondCall = vi.mocked(UpdateCommand).mock.calls[1]?.[0] as any;

    expect(firstCall.Key).toEqual({ userId: '1234-5678' });
    expect(secondCall.Key).toEqual({ userId: '1234-5678' });
    // Due to if_not_exists in the UpdateExpression, fields won't be overwritten in DynamoDB
  });
});
