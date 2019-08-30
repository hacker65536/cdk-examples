#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { SsmportforwardStack } from '../lib/ssmportforward-stack';

const app = new cdk.App();
new SsmportforwardStack(app, 'SsmportforwardStack');
