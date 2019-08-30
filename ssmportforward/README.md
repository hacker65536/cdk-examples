# ssm port forwarding



https://aws.amazon.com/blogs/aws/new-port-forwarding-using-aws-system-manager-sessions-manager/





aws
--
require

- agent: amazon-ssm-agent >2.3.672
- iam role:  AmazonSSMManagedInstanceCore



```console
# rpm -q  amazon-ssm-agent
amazon-ssm-agent-2.3.701.0-1.x86_64
```

```console
$ aws iam list-attached-role-policies --role-name SsmportforwardStack-RANDOMID
{
    "AttachedPolicies": [
        {
            "PolicyName": "AmazonSSMManagedInstanceCore",
            "PolicyArn": "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
        }
    ]
}
```




local
--
- session-manager-plugin 1.1.26.0+
- aws cli 1.16.220+



```console
$ session-manager-plugin --version
1.1.26.0
```


```console
$ aws --version
aws-cli/1.16.228 Python/2.7.15+ Linux/4.4.0-17134-Microsoft botocore/1.12.218
```

configure aws cli
`$ aws configure`




```bash
#!/usr/bin/env bash

instanceid=$1

port1=$2
port2=$3


if [[ -n $2 && -n $3 ]] ;then
aws ssm start-session --target  $instanceid  --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["'$2'"],"localPortNumber":["'$3'"]}'
else
aws ssm start-session --target  $instanceid
fi
```


```console
$ bash session.sh 80 9999
```

```
Starting session with SessionId: yoursessionname-0bd07c08bc955a579
Port 9999 opened for sessionId yoursessionname-0bd07c08bc955a579
Connection accepted for session yoursessionname-0bd07c08bc955a579.
```


open your browser `http://localhost:9999` 
