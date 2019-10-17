#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { LambdarustStack } from '../lib/lambdarust-stack';

const app = new cdk.App();
new LambdarustStack(app, 'LambdarustStack');
