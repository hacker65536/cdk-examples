import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import iam = require("@aws-cdk/aws-iam");
import { CfnOutput } from "@aws-cdk/core";
export class SsmportforwardStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    var userdatacommands: string[] = [
      "sudo amazon-linux-extras install nginx1.12",
      "sudo systemctl start nginx",
      "sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm" //require 2.3.672.0+
    ];

    const userdata = ec2.UserData.forLinux({
      shebang: "#!/bin/env bash"
    });

    userdata.addCommands(...userdatacommands);

    const vpc = new ec2.Vpc(this, "vcp", {
      maxAzs: 3,
      natGateways: 1
    });

    const websrv = new ec2.Instance(this, "websrv", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),
      vpc: vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE },
      userData: userdata
    });

    const policies: string[] = [
      "AmazonSSMManagedInstanceCore"
      //"service-role/AmazonEC2RoleforSSM"
    ];

    for (let v of policies) {
      websrv.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName(v)
      );
    }

    new CfnOutput(this, "id", {
      value: websrv.instanceId
    });
  }
}
