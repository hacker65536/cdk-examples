#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { FirelensStack } from '../lib/firelens-stack';

const app = new cdk.App();
new FirelensStack(app, 'FirelensStack');
