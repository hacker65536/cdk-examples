import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import path = require("path");

export class LambdarustStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const fn = new lambda.Function(this, "MyLayeredLambda", {
      code: lambda.Code.fromAsset(
        path.join(__dirname, "aws-lambda-rust-runtime/lambda.zip"),
      ),
      handler: "doesnt.matter",
      runtime: lambda.Runtime.PROVIDED,
      environment: { ["RUST_BACKTRACE"]: "1" },
    });

    new cdk.CfnOutput(this, "lambda", {
      value: `aws lambda invoke --function-name ${fn.functionName} --payload '{"firstName": "Rustacean"}' res.json && cat res.json`,
    });
  }
}
