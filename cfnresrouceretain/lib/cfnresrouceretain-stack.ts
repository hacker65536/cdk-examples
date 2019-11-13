import cdk = require("@aws-cdk/core");
import { Vpc } from "@aws-cdk/aws-ec2";

export class CfnresrouceretainStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new Vpc(this, "vpc", {
      maxAzs: 2
    });
    const resources = vpc.node.findAll();
    resources.forEach(v => {
      let r = v as cdk.CfnResource;
      typeof r.applyRemovalPolicy === "function" &&
        r.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    });
    const r = vpc.node.findChild("PublicSubnet1") as cdk.CfnResource;
    new cdk.CfnOutput(this, "output", {
      value: r.node.findAll().toString()
    });
    // TODO
  }
}
