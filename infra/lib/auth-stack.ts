import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CfnOutput,
  CfnParameter,
  Duration,
  Fn,
  RemovalPolicy,
  SecretValue,
  Stack,
  type StackProps,
} from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const usersTable = new dynamodb.Table(this, "UsersTable", {
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const postConfirmation = new lambdaNodejs.NodejsFunction(
      this,
      "PostConfirmation",
      {
        entry: path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          "../../lambda/post-confirmation.ts",
        ),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_24_X,
        timeout: Duration.seconds(10),
        environment: {
          USERS_TABLE_NAME: usersTable.tableName,
        },
        bundling: {
          minify: true,
          sourceMap: true,
        },
      },
    );
    // The post-confirmation trigger only creates or updates the user profile.
    usersTable.grant(postConfirmation, "dynamodb:UpdateItem");

    const postAuthentication = new lambdaNodejs.NodejsFunction(
      this,
      "PostAuthentication",
      {
        entry: path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          "../../lambda/post-authentication.ts",
        ),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_24_X,
        timeout: Duration.seconds(10),
        environment: {
          USERS_TABLE_NAME: usersTable.tableName,
        },
        bundling: {
          minify: true,
          sourceMap: true,
        },
      },
    );
    usersTable.grant(postAuthentication, "dynamodb:UpdateItem");

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "ctrlaltwin-users",
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: true },
      signInCaseSensitive: false,
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        fullname: { required: true, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true,
        tempPasswordValidity: Duration.days(3),
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: { otp: true, sms: false },
      lambdaTriggers: {
        postConfirmation,
        postAuthentication,
      },
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const userPoolDomain = new cognito.UserPoolDomain(this, "CognitoDomain", {
      userPool,
      cognitoDomain: {
        domainPrefix: `ctrlaltwin-auth-${this.account}-${this.region}`,
      },
    });

    const googleSecretVersion = new CfnParameter(this, "GoogleSecretVersion", {
      type: "String",
      default: "",
      description: "Version ID of the Google OAuth secret to force Cognito provider update",
    });

    const googleSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "GoogleOAuthSecret",
      "ctrlaltwin/google-oauth"
    );

    const googleProvider = new cognito.UserPoolIdentityProviderGoogle(this, "GoogleProvider", {
      userPool,
      clientId: googleSecret.secretValueFromJson("clientId").unsafeUnwrap(),
      clientSecretValue: SecretValue.unsafePlainText(
        Fn.sub('{{resolve:secretsmanager:ctrlaltwin/google-oauth:SecretString:clientSecret::${GoogleSecretVersion}}}')
      ),
      attributeMapping: {
        email: cognito.ProviderAttribute.GOOGLE_EMAIL,
        fullname: cognito.ProviderAttribute.GOOGLE_NAME,
        givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
        familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
      },
      scopes: ["openid", "email", "profile"],
    });

    const userPoolClient = userPool.addClient("WebClient", {
      userPoolClientName: "ctrlaltwin-web",
      generateSecret: false,
      preventUserExistenceErrors: true,
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        cognito.UserPoolClientIdentityProvider.GOOGLE,
      ],
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          "http:" + "//localhost:5174/login",
          "http:" + "//localhost:5173/login",
        ],
        logoutUrls: [
          "http:" + "//localhost:5174/login",
          "http:" + "//localhost:5173/login",
        ],
      },
      authFlows: {
        userSrp: true,
      },
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30),
      enableTokenRevocation: true,
    });

    userPoolClient.node.addDependency(googleProvider);

    new cognito.CfnUserPoolGroup(this, "UserGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "user",
      description: "Standard CtrlAltWin users",
      precedence: 10,
    });

    new cognito.CfnUserPoolGroup(this, "AdminGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "admin",
      description: "CtrlAltWin administrators",
      precedence: 1,
    });

    new CfnOutput(this, "AwsRegion", { value: this.region });
    new CfnOutput(this, "CognitoUserPoolId", {
      value: userPool.userPoolId,
    });
    new CfnOutput(this, "CognitoUserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    new CfnOutput(this, "CognitoDomainOutput", {
      value: userPoolDomain.domainName,
    });
    new CfnOutput(this, "UsersTableName", { value: usersTable.tableName });
  }
}
