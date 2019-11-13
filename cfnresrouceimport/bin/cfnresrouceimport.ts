#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CfnresrouceimportStack } from '../lib/cfnresrouceimport-stack';

const app = new cdk.App();
new CfnresrouceimportStack(app, 'CfnresrouceimportStack');
