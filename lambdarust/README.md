# Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

```
cd lib
git clone https://github.com/awslabs/aws-lambda-rust-runtime.git
cd aws-lambda-runtime
```

```
cat <<'EOF' >> Dockerfile
FROM lambci/lambda:build-provided
RUN curl https://sh.rustup.rs -sSf | /bin/sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup install stable
# RUN yum install -y gcc gcc-c++ make openssl openssl-devel
RUN mkdir /code
WORKDIR /code
EOF
```

```
docker build . -t lambda_builder
docker run --rm -v ${PWD}:/code -v ${HOME}/.cargo/registry:/root/.cargo/registry -v ${HOME}/.cargo/git:/root/.cargo/git lambda_builder cargo build -p lambda_runtime --example basic --release
```
