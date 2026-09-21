import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function upsertUserProfile(
  client: DynamoDBDocumentClient,
  tableName: string,
  event: any
): Promise<void> {
  const now = new Date().toISOString();

  const userId = event.request.userAttributes.sub;
  if (!userId) {
    throw new Error("Missing sub attribute");
  }

  const email = event.request.userAttributes.email;
  const displayName = event.request.userAttributes.name;

  let isGoogle = false;

  if (event.request.userAttributes.identities) {
    try {
      const identities = JSON.parse(event.request.userAttributes.identities);
      if (Array.isArray(identities)) {
        if (identities.some((id: any) => id && id.providerName === "Google")) {
          isGoogle = true;
        }
      }
    } catch {
      // Ignore JSON parse errors and default to native
    }
  }

  const authProvider = isGoogle ? "google" : "cognito";
  const username = isGoogle ? `google_${userId}` : event.userName;

  const updateExpressionParts = [
    "#updatedAt = :updatedAt",
    "#authProvider = if_not_exists(#authProvider, :authProvider)",
    "#username = if_not_exists(#username, :username)",
    "#createdAt = if_not_exists(#createdAt, :createdAt)",
    "#role = if_not_exists(#role, :role)",
  ];

  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
    "#authProvider": "authProvider",
    "#username": "username",
    "#createdAt": "createdAt",
    "#role": "role",
  };

  const expressionAttributeValues: Record<string, any> = {
    ":updatedAt": now,
    ":authProvider": authProvider,
    ":username": username,
    ":createdAt": now,
    ":role": "user",
  };

  if (email) {
    updateExpressionParts.push("#email = if_not_exists(#email, :email)");
    expressionAttributeNames["#email"] = "email";
    expressionAttributeValues[":email"] = email.toLowerCase();
  }

  if (displayName) {
    updateExpressionParts.push("#displayName = if_not_exists(#displayName, :displayName)");
    expressionAttributeNames["#displayName"] = "displayName";
    expressionAttributeValues[":displayName"] = displayName;
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
}
