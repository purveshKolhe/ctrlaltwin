import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { PostAuthenticationTriggerHandler } from "aws-lambda";
import { upsertUserProfile } from "./profile-sync.js";

const tableName = process.env.USERS_TABLE_NAME;
if (!tableName) throw new Error("USERS_TABLE_NAME is required");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: PostAuthenticationTriggerHandler = async (event) => {
  await upsertUserProfile(client, tableName, event);
  return event;
};
