# lambda layer

https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html#configuration-layers-path

Place libraries in one of the folders supperted by the runtime.

Python libraries shoud place in **`python/`**.

```bash
cd ./lib/lambda_layer/python
pip3 install -r requirements.txt -t .
```
