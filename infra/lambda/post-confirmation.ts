import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { PostConfirmationTriggerHandler } from "aws-lambda";

const tableName = process.env.USERS_TABLE_NAME;
if (!tableName) throw new Error("USERS_TABLE_NAME is required");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const now = new Date().toISOString();
  const email = event.request.userAttributes.email;
  const displayName = event.request.userAttributes.name;

  if (!email || !displayName) {
    throw new Error("Confirmed Cognito user is missing email or name");
  }

  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        userId: event.userName,
        email: email.toLowerCase(),
        displayName,
        role: "user",
        createdAt: now,
        updatedAt: now,
      },
      ConditionExpression: "attribute_not_exists(userId)",
    }),
  );

  return event;
};
