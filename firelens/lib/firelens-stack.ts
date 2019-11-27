import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import eks = require("@aws-cdk/aws-eks");
import ecs = require("@aws-cdk/aws-ecs");
import iam = require("@aws-cdk/aws-iam");
import firehose = require("@aws-cdk/aws-kinesisfirehose");
import s3 = require("@aws-cdk/aws-s3");
import athena = require("@aws-cdk/aws-athena");
import ecra = require("@aws-cdk/aws-ecr-assets");

export class FirelensStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // firehose
    const fires3 = new s3.Bucket(this, "fires3");
    const firerole = new iam.Role(this, "firehoserole", {
      assumedBy: new iam.ServicePrincipal("firehose.amazonaws.com"),
    });

    const firepolicies = new iam.Policy(this, "firepolicy", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:AbortMultipartUpload",
            "s3:GetBucketLocation",
            "s3:GetObject",
            "s3:ListBucket",
            "s3:ListBucketMultipartUploads",
            "s3:PutObject",
          ],
          resources: [`${fires3.bucketArn}`, `${fires3.bucketArn}/*`],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "kinesis:DescribeStream",
            "kinesis:GetShardIterator",
            "kinesis:GetRecords",
          ],
          resources: ["arn:aws:logs:*:*:log-group:*:*:*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["logs:CreateLogGroup"],
          resources: ["*"],
        }),
      ],
      roles: [firerole],
    });

    ["eks", "ecs"].forEach(v => {
      new firehose.CfnDeliveryStream(this, `${v}stream`, {
        s3DestinationConfiguration: {
          bucketArn: fires3.bucketArn,
          bufferingHints: {
            intervalInSeconds: 300, //default 300  min-max 60-900
            sizeInMBs: 5, //default 5   min-max s3 = 1-128 es = 1-100
          },
          compressionFormat: "GZIP",
          roleArn: firerole.roleArn,
        },
        deliveryStreamName: `${v}stream`,
      });
    });

    // ECR

    const asset = new ecra.DockerImageAsset(this, "MyBuildImage", {
      //      directory: path.join(__dirname, "my-image")
      directory: "dockerimgdir/awsfluentbit",
    });

    // USER DATA
    /*
    const userdata = ec2.UserData.forLinux({
      shebang: "#!/usr/bin/env bash",
    });
    const commands: string[] = [
      'echo "ECS_AVAILABLE_LOGGING_DRIVERS=[\\"awslogs\\",\\"fluentd\\"]" >> /etc/ecs/ecs.config',
    ];
    userdata.addCommands(...commands);
    ecsasg.addUserData(...[userdata.render()]);
    */

    // ECS
    const vpc = new ec2.Vpc(this, "ecsvpc", {
      maxAzs: 2,
    });
    const ecscluster = new ecs.Cluster(this, "ecscluster", {
      vpc,
    });

    const ecsnodesasg = ecscluster.addCapacity("defaultasg", {
      instanceType: new ec2.InstanceType("t2.xlarge"),
      desiredCapacity: 2,
    });

    ecsnodesasg.addUserData(
      'echo "ECS_AVAILABLE_LOGGING_DRIVERS=[\\"awslogs\\",\\"fluentd\\"]" >> /etc/ecs/ecs.config',
    );

    const fbdstaskd = new ecs.Ec2TaskDefinition(this, "task", {
      networkMode: ecs.NetworkMode.HOST,
      volumes: [
        {
          name: "socket",
          host: {
            sourcePath: "/var/run",
          },
        },
      ],
    });

    fbdstaskd
      .addContainer("fbds", {
        image: ecs.ContainerImage.fromEcrRepository(asset.repository),
        environment: { ["FLB_LOG_LEVEL"]: "INFO" },
        memoryReservationMiB: 50,
        logging: ecs.LogDriver.awsLogs({ streamPrefix: "fbds" }),
      })
      .addMountPoints({
        containerPath: "/var/run",
        sourceVolume: "socket",
        readOnly: false,
      });

    const ecsfbdssvc = new ecs.Ec2Service(this, "svc", {
      cluster: ecscluster,
      taskDefinition: fbdstaskd,
      daemon: true,
    });

    const fbdspolicies = new iam.Policy(this, "ecsFluentBitDS", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["firehose:PutRecordBatch"],
          resources: ["*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["logs:PutLogEvents"],
          resources: ["arn:aws:logs:*:*:log-group:*:*:*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "logs:CreateLogStream",
            "logs:DescribeLogStreams",
            "logs:PutLogEvents",
          ],
          resources: ["arn:aws:logs:*:*:log-group:*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["logs:CreateLogGroup"],
          resources: ["*"],
        }),
      ],
      roles: [fbdstaskd.taskRole],
    });

    const nginxtaskd = new ecs.Ec2TaskDefinition(this, "nginx-fluentbitdemo");
    nginxtaskd
      .addContainer("nginxtcd", {
        logging: ecs.LogDrivers.fluentd({
          address: "unix:///var/run/fluent.sock",
          tag: "logs-from-nginx",
        }),
        image: ecs.ContainerImage.fromRegistry("nginx:1.17"),
        memoryLimitMiB: 100,
      })
      .addPortMappings({
        hostPort: 80,
        protocol: ecs.Protocol.TCP,
        containerPort: 80,
      });

    const ecsnginxsvc = new ecs.Ec2Service(this, "nginxsvc", {
      taskDefinition: nginxtaskd,
      cluster: ecscluster,
      desiredCount: 1,
    });

    // EKS
    const clusterAdmin = new iam.Role(this, "AdminRole", {
      assumedBy: new iam.AccountRootPrincipal(),
    });

    const cluster = new eks.Cluster(this, "ekscluster", {
      mastersRole: clusterAdmin,
      //      defaultCapacity: 2
    });

    const workers = cluster.defaultCapacity!;
    /*
    const workersrole = cluster.node
      .findChild("DefaultCapacity")
      .node.findChild("InstanceRole")
      .node.findChild("Resource") as iam.CfnRole;

    /*
    const policies = new iam.Policy(this, "FluentBitDS");
    policies.addStatements(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["firehose:PutRecordBatch"],
        resources: ["*"]
      })
    );
    policies.attachToRole(workersrole);
    */

    const eksfbpolicies = new iam.Policy(this, "eksFluentBitDS", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["firehose:PutRecordBatch"],
          resources: ["*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["logs:PutLogEvents"],
          resources: ["arn:aws:logs:*:*:log-group:*:*:*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "logs:CreateLogStream",
            "logs:DescribeLogStreams",
            "logs:PutLogEvents",
          ],
          resources: ["arn:aws:logs:*:*:log-group:*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["logs:CreateLogGroup"],
          resources: ["*"],
        }),
      ],
      roles: [workers.role],
    });

    /*
    const k = new kms.Key(this, "MyKey", {
      enableKeyRotation: true,
    });
    */
    // athena

    const cdbquery = `create database firelensdb`;

    const cdb = new athena.CfnNamedQuery(this, "atq1", {
      database: "defualt",
      queryString: cdbquery,
    });

    ["ecs", "eks"].forEach(v => {
      const query = `CREATE EXTERNAL TABLE fluentbit_${v} (
    agent string,
    code string,
    host string,
    method string,
    path string,
    referer string,
    remote string,
    size string,
    user string
    )
    ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
    LOCATION 's3://${fires3.bucketName}/'`;

      new athena.CfnNamedQuery(this, v, {
        database: "firelensdb",
        queryString: query,
      });
    });

    /*
    var log = "";
    for (const worker of cluster.node.children) {
      log += worker.node.id + "\n";
    }
    */
    /*
    new cdk.CfnOutput(this, "asgid", {
      value: workers.node.id,
    });
    */
  }
}
