import { describe, it, expect, vi, beforeEach } from 'vitest';
process.env.USERS_TABLE_NAME = 'TestUsersTable';
import { handler } from './post-confirmation.js';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { PostConfirmationTriggerEvent } from 'aws-lambda';

vi.mock('@aws-sdk/lib-dynamodb', async () => {
  const actual = await vi.importActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: vi.fn(() => ({
        send: vi.fn().mockResolvedValue({})
      }))
    },
    UpdateCommand: vi.fn()
  };
});

describe('post-confirmation handler', () => {
  const mockSend = vi.fn().mockResolvedValue({});
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.USERS_TABLE_NAME = 'TestUsersTable';
    
    // Override the client created at module scope
    const docClientMock = { send: mockSend };
    (DynamoDBDocumentClient.from as any).mockReturnValue(docClientMock);
  });

  function createEvent(triggerSource: string, overrides: Partial<PostConfirmationTriggerEvent> = {}): PostConfirmationTriggerEvent {
    return {
      version: '1',
      region: 'us-east-1',
      userPoolId: 'us-east-1_xxxxx',
      userName: 'testuser',
      callerContext: {
        awsSdkVersion: 'aws-sdk-js-2.1093.0',
        clientId: 'xxxxx'
      },
      request: {
        userAttributes: {
          sub: '1234-5678-uuid',
          email: 'test@example.com',
          name: 'Test User'
        }
      },
      response: {},
      triggerSource: triggerSource as any,
      ...overrides
    };
  }

  it('stores Cognito sub as userId and event.userName as username', async () => {
    const event = createEvent('PostConfirmation_ConfirmSignUp');
    await handler(event, {} as any, () => {});

    expect(UpdateCommand).toHaveBeenCalledTimes(1);
    const updateArgs = (UpdateCommand as any).mock.calls[0][0];

    expect(updateArgs.TableName).toBe('TestUsersTable');
    expect(updateArgs.Key).toEqual({ userId: '1234-5678-uuid' });
    expect(updateArgs.ExpressionAttributeValues[':username']).toBe('testuser');
    expect(updateArgs.ExpressionAttributeValues[':email']).toBe('test@example.com');
    expect(updateArgs.ExpressionAttributeValues[':displayName']).toBe('Test User');
    expect(updateArgs.ExpressionAttributeValues[':authProvider']).toBe('cognito');
  });

  it('remains idempotent on repeated signup confirmation (uses if_not_exists)', async () => {
    const event = createEvent('PostConfirmation_ConfirmSignUp');
    await handler(event, {} as any, () => {});

    expect(UpdateCommand).toHaveBeenCalledTimes(1);
    const updateArgs = (UpdateCommand as any).mock.calls[0][0];

    // Verify it uses if_not_exists for createdAt and role
    expect(updateArgs.UpdateExpression).toContain('#createdAt = if_not_exists(#createdAt, :createdAt)');
    expect(updateArgs.UpdateExpression).toContain('#role = if_not_exists(#role, :role)');
  });

  it('creates profile for AdminConfirmSignUp', async () => {
    const event = createEvent('PostConfirmation_AdminConfirmSignUp');
    await handler(event, {} as any, () => {});

    expect(UpdateCommand).toHaveBeenCalledTimes(1);
    const updateArgs = (UpdateCommand as any).mock.calls[0][0];
    expect(updateArgs.Key).toEqual({ userId: '1234-5678-uuid' });
  });

  it('does not overwrite profile on ConfirmForgotPassword', async () => {
    const event = createEvent('PostConfirmation_ConfirmForgotPassword');
    const result = await handler(event, {} as any, () => {});

    expect(UpdateCommand).not.toHaveBeenCalled();
    expect(result).toBe(event);
  });
});
