#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AuthStack } from "../lib/auth-stack.js";

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT;

new AuthStack(app, "CtrlAltWinAuthStack", {
  description: "CtrlAltWin authentication and user-profile infrastructure",
  env: {
    ...(account ? { account } : {}),
    region: process.env.CDK_DEFAULT_REGION ?? "ap-south-1",
  },
});
