#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { LambdalayerStack } from '../lib/lambdalayer-stack';

const app = new cdk.App();
new LambdalayerStack(app, 'LambdalayerStack');
