import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { PostConfirmationTriggerHandler } from "aws-lambda";

const tableName = process.env.USERS_TABLE_NAME;
if (!tableName) throw new Error("USERS_TABLE_NAME is required");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: PostConfirmationTriggerHandler = async (event) => {
  if (event.triggerSource === "PostConfirmation_ConfirmForgotPassword") {
    return event;
  }

  const now = new Date().toISOString();
  const email = event.request.userAttributes.email;
  const displayName = event.request.userAttributes.name;
  // Cognito 'sub' is the unique, immutable identifier
  const userId = event.request.userAttributes.sub;

  if (!email || !displayName) {
    throw new Error("Confirmed Cognito user is missing email or name");
  }
  if (!userId) {
    throw new Error("Missing sub attribute");
  }

  let authProvider = "cognito";
  if (event.request.userAttributes.identities) {
    try {
      const identities = JSON.parse(event.request.userAttributes.identities);
      if (identities.some((id: any) => id.providerName.toLowerCase() === "google")) {
        authProvider = "google";
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Do not store the generated username for Google profiles
  const isGoogle = authProvider === "google" || event.userName.toLowerCase().startsWith("google_");
  const username = isGoogle ? undefined : event.userName;

  const updateExpressionParts = [
    "#email = :email",
    "#displayName = :displayName",
    "#authProvider = :authProvider",
    "#updatedAt = :updatedAt",
    "#role = if_not_exists(#role, :role)",
    "#createdAt = if_not_exists(#createdAt, :createdAt)",
  ];

  const expressionAttributeNames: Record<string, string> = {
    "#email": "email",
    "#displayName": "displayName",
    "#authProvider": "authProvider",
    "#updatedAt": "updatedAt",
    "#role": "role",
    "#createdAt": "createdAt",
  };

  const expressionAttributeValues: Record<string, any> = {
    ":email": email.toLowerCase(),
    ":displayName": displayName,
    ":authProvider": authProvider,
    ":updatedAt": now,
    ":role": "user",
    ":createdAt": now,
  };

  if (username) {
    updateExpressionParts.push("#username = :username");
    expressionAttributeNames["#username"] = "username";
    expressionAttributeValues[":username"] = username;
  }

  await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userId },
      UpdateExpression: "SET " + updateExpressionParts.join(", "),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );

  return event;
};
