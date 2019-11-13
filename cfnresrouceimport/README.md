dynamodb を`DeletionPolicy: Retain`で作成する

show template

```console
$ cdk synth
```

```yml
Resources:
  dyE03B5C78:
    Type: AWS::DynamoDB::Table
    Properties:
      KeySchema:
        - AttributeName: key
          KeyType: HASH
      AttributeDefinitions:
        - AttributeName: key
          AttributeType: S
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5
    UpdateReplacePolicy: Retain
    DeletionPolicy: Retain
    Metadata:
      aws:cdk:path: CfnresrouceimportStack/dy/Resource
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Properties:
      Modules: aws-cdk=1.16.2,@aws-cdk/aws-applicationautoscaling=1.16.2,@aws-cdk/aws-autoscaling-common=1.16.2,@aws-cdk/aws-cloudwatch=1.16.2,@aws-cdk/aws-dynamodb=1.16.2,@aws-cdk/aws-iam=1.16.2,@aws-cdk/core=1.16.2,@aws-cdk/cx-api=1.16.2,@aws-cdk/region-info=1.16.2,jsii-runtime=node.js/v12.12.0
    Condition: CDKMetadataAvailable
Conditions:
  CDKMetadataAvailable:
    Fn::Or:
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ca-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-northwest-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-central-1
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-2
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-3
          - Fn::Equals:
              - Ref: AWS::Region
              - me-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - sa-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-2
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-2
```

create stack

```console
$ cdk deploy
```

```
CfnresrouceimportStack: deploying...
CfnresrouceimportStack: creating CloudFormation changeset...
 0/3 | 5:52:51 AM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata   | CDKMetadata
 0/3 | 5:52:51 AM | CREATE_IN_PROGRESS   | AWS::DynamoDB::Table | dy (dyE03B5C78)
 0/3 | 5:52:51 AM | CREATE_IN_PROGRESS   | AWS::DynamoDB::Table | dy (dyE03B5C78) Resource creation Initiated
 0/3 | 5:52:53 AM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata   | CDKMetadata Resource creation Initiated
 1/3 | 5:52:53 AM | CREATE_COMPLETE      | AWS::CDK::Metadata   | CDKMetadata
 2/3 | 5:53:23 AM | CREATE_COMPLETE      | AWS::DynamoDB::Table | dy (dyE03B5C78)
 3/3 | 5:53:24 AM | CREATE_COMPLETE      | AWS::CloudFormation::Stack | CfnresrouceimportStack

 ✅  CfnresrouceimportStack

Stack ARN:
arn:aws:cloudformation:us-east-1:000000000000:stack/CfnresrouceimportStack/cedfb170-05d9-11ea-8ed3-12f057d255e7
```

show resources

```
$ aws2 cloudformation list-stack-resources --stack-name CfnresrouceimportStack --output yaml
StackResourceSummaries:
- DriftInformation:
    StackResourceDriftStatus: NOT_CHECKED
  LastUpdatedTimestamp: '2019-11-13T05:52:53.469000+00:00'
  LogicalResourceId: CDKMetadata
  PhysicalResourceId: cedfb170-05d9-11ea-8ed3-12f057d255e7
  ResourceStatus: CREATE_COMPLETE
  ResourceType: AWS::CDK::Metadata
- DriftInformation:
    StackResourceDriftStatus: NOT_CHECKED
  LastUpdatedTimestamp: '2019-11-13T05:53:23.208000+00:00'
  LogicalResourceId: dyE03B5C78
  PhysicalResourceId: CfnresrouceimportStack-dyE03B5C78-TXA722ZZM9LP
  ResourceStatus: CREATE_COMPLETE
  ResourceType: AWS::DynamoDB::Table
```

delete stack

```console
$ cdk destroy
Are you sure you want to delete: CfnresrouceimportStack (y/n)? y
CfnresrouceimportStack: destroying...

 ✅  CfnresrouceimportStack: destroyed
```

削除されていないことを確認

```console
$ aws2 dynamodb describe-table --table-name CfnresrouceimportStack-dyE03B5C78-TXA722ZZM9LP --output yaml
Table:
  AttributeDefinitions:
  - AttributeName: key
    AttributeType: S
  CreationDateTime: '2019-11-13T05:52:51.841000+00:00'
  ItemCount: 0
  KeySchema:
  - AttributeName: key
    KeyType: HASH
  ProvisionedThroughput:
    NumberOfDecreasesToday: 0
    ReadCapacityUnits: 5
    WriteCapacityUnits: 5
  TableArn: arn:aws:dynamodb:us-east-1:000000000000:table/CfnresrouceimportStack-dyE03B5C78-TXA722ZZM9LP
  TableId: 90365816-e5f5-48e1-be47-7f6ec638327c
  TableName: CfnresrouceimportStack-dyE03B5C78-TXA722ZZM9LP
  TableSizeBytes: 0
  TableStatus: ACTIVE
```

`template.yml`

```yml
Resources:
  mytable:
    Type: AWS::DynamoDB::Table
    Properties:
      KeySchema:
        - AttributeName: key
          KeyType: HASH
      AttributeDefinitions:
        - AttributeName: key
          AttributeType: S
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5
    DeletionPolicy: Retain
```

cloudformation の HP の`Create stack ▼` から `With existing resources (import resources)`を選択

- Step1 -> Next
- Step2 `Upload a template file`を選択し、`Choose file`ボタンから`template.yml`を upload して -> Next
- Step3 `Identifier value`に `CfnresrouceimportStack-dyE03B5C78-TXA722ZZM9LP`を入力 -> Next
- Step4 `Stack name`に`dynamodbimport`を入力して -> Next
- Step5 -> `Import resources`

retain から delete に変更して stack を削除する

`template2.yml`

```yaml
Resources:
  dyE03B5C78:
    Type: AWS::DynamoDB::Table
    Properties:
      KeySchema:
        - AttributeName: key
          KeyType: HASH
      AttributeDefinitions:
        - AttributeName: key
          AttributeType: S
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5
    DeletionPolicy: Delete
```

`Update stack`から`Replace current template`を選択して、`template2.yml`を upload、Next->Next->Update Stack

stack `dynamodbimport`を Delete して dynamodb table も一緒に削除されていることを確認
