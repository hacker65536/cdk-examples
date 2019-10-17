# lambda layer

https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html#configuration-layers-path

Place libraries in one of the folders supperted by the runtime.

Python libraries shoud place in **`python/`**.

```console
$ npm i
```
```console
$ cd ./lib/lambda_layer/python
$ cat requirements.txt
boto3 == 1.9.251
```
```console
$ pip3 install -r requirements.txt -t .
```

```console
$ cdk deploy
```

```console
$ aws lambda invoke --function-name LambdalayerStack-MyLayeredLambdaXXXXX-XXXXXX res.json && cat res.json
{
    "StatusCode": 200,
    "ExecutedVersion": "$LATEST"
}
{"version": "1.9.251"}⏎                                        
```
