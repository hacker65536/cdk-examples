import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import path = require("path");

export class LambdalayerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const layer = new lambda.LayerVersion(this, "MyLayer", {
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda_layer")),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_7],
      description: "A layer to test the L2 construct",
    });

    // To grant usage by other AWS accounts
    layer.addPermission("remote-account-grant", {
      accountId: cdk.Stack.of(this).account,
    });

    // To grant usage to all accounts in some AWS Ogranization
    // layer.grantUsage({ accountId: '*', organizationId });

    const fn = new lambda.Function(this, "MyLayeredLambda", {
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda_function")),
      handler: "lambda_function.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_7,
      layers: [layer],
    });
  }
}
