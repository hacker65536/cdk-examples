# Rust Runtime for lambda

```
npm i
```
```
git clone https://github.com/awslabs/aws-lambda-rust-runtime.git lib/aws-lambda-rust-runtime
pushd lib/aws-lambda-rust-runtime
```

https://github.com/awslabs/aws-lambda-rust-runtime/issues/17

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
   Compiling lambda_runtime_client v0.2.2 (/code/lambda-runtime-client)
error: trait objects without an explicit `dyn` are deprecated
   --> lambda-runtime-client/src/error.rs:109:32
    |
109 |     fn cause(&self) -> Option<&Fail> {
    |                                ^^^^ help: use `dyn`: `dyn Fail`
    |
note: lint level defined here
   --> lambda-runtime-client/src/lib.rs:2:9
    |
2   | #![deny(warnings)]
    |         ^^^^^^^^
    = note: `#[deny(bare_trait_objects)]` implied by `#[deny(warnings)]`

error: aborting due to previous error

error: Could not compile `lambda_runtime_client`.
warning: build failed, waiting for other jobs to finish...
error: build failed
```

```
   Compiling lambda_runtime_core v0.1.2 (/code/lambda-runtime-core)
error: trait objects without an explicit `dyn` are deprecated
  --> lambda-runtime-core/src/error.rs:80:32
   |
80 |     fn cause(&self) -> Option<&Error> {
   |                                ^^^^^ help: use `dyn`: `dyn Error`
   |
note: lint level defined here
  --> lambda-runtime-core/src/lib.rs:2:9
   |
2  | #![deny(warnings)]
   |         ^^^^^^^^
   = note: `#[deny(bare_trait_objects)]` implied by `#[deny(warnings)]`

error: aborting due to previous error

error: Could not compile `lambda_runtime_core`.
warning: build failed, waiting for other jobs to finish...
error: build failed
```

fix codes for above erros

```
sed -e '109 s/Fail/dyn Fail/' -i lambda-runtime-client/src/error.rs
sed -e '80 s/Error/dyn Error/' -i lambda-runtime-core/src/error.rs
```

```
docker build . -t lambda_builder
docker run --rm -v ${PWD}:/code -v ${HOME}/.cargo/registry:/root/.cargo/registry -v ${HOME}/.cargo/git:/root/.cargo/git lambda_builder cargo build -p lambda_runtime --example basic --release
cp ./target/release/examples/basic ./bootstrap && zip lambda.zip bootstrap && rm bootstrap
popd
```

```
cdk deploy
```

```
aws lambda invoke --function-name LambdarustStack-MyLayeredLambda9A3008D1-XXXXXXXXX --payload '{"firstName": "Rustacean"}' res.json && cat res.json
{
    "StatusCode": 200,
    "ExecutedVersion": "$LATEST"
}
{"message":"Hello, Rustacean!"}⏎
```


environment
--

[lambci / lambda : build-provided](https://hub.docker.com/layers/lambci/lambda/build-provided/images/sha256-ab3e09ef5224171b9be5803cb58b5b5fbeea97852c097da829b0ae6b8a9ce6f3)

`sha256:ab3e09ef5224171b9be5803cb58b5b5fbeea97852c097da829b0ae6b8a9ce6f3`

```
docker run --rm lambda_builder cargo --version
cargo 1.38.0 (23ef9a4ef 2019-08-20)
```

note.

Use docker with rootless or excute `chown -R yourid. .` when you need to clean.
