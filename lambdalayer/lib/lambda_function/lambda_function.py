import boto3

def lambda_handler(event, context):
    return {
        'version': boto3.__version__
    }
