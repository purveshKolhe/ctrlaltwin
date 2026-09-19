import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

export type UserRole = "user" | "admin";

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export class UserProfileRepository {
  readonly #tableName: string;
  readonly #client: DynamoDBDocumentClient;

  constructor(
    tableName: string,
    client = DynamoDBDocumentClient.from(new DynamoDBClient({})),
  ) {
    if (!tableName) throw new Error("Users table name is required");
    this.#tableName = tableName;
    this.#client = client;
  }

  async create(profile: UserProfile): Promise<void> {
    await this.#client.send(
      new PutCommand({
        TableName: this.#tableName,
        Item: profile,
        ConditionExpression: "attribute_not_exists(userId)",
      }),
    );
  }

  async get(userId: string): Promise<UserProfile | null> {
    const result = await this.#client.send(
      new GetCommand({
        TableName: this.#tableName,
        Key: { userId },
        ConsistentRead: true,
      }),
    );
    return (result.Item as UserProfile | undefined) ?? null;
  }

  async updateDisplayName(
    userId: string,
    displayName: string,
  ): Promise<UserProfile> {
    const now = new Date().toISOString();
    const result = await this.#client.send(
      new UpdateCommand({
        TableName: this.#tableName,
        Key: { userId },
        UpdateExpression: "SET displayName = :displayName, updatedAt = :updatedAt",
        ConditionExpression: "attribute_exists(userId)",
        ExpressionAttributeValues: {
          ":displayName": displayName.trim(),
          ":updatedAt": now,
        },
        ReturnValues: "ALL_NEW",
      }),
    );
    return result.Attributes as UserProfile;
  }
}
