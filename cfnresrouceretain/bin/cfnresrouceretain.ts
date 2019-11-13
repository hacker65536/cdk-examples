#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CfnresrouceretainStack } from '../lib/cfnresrouceretain-stack';

const app = new cdk.App();
new CfnresrouceretainStack(app, 'CfnresrouceretainStack');
