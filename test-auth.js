#!/usr/bin/env node

/**
 * Test authentication with Sling API
 *
 * Usage:
 *   node test-auth.js
 *
 * This will attempt to authenticate using credentials from .env file
 * and display detailed debug information.
 */

import { loginToSling } from './dist/auth.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAuth() {
  console.log('='.repeat(60));
  console.log('Sling API Authentication Test');
  console.log('='.repeat(60));
  console.log();

  // Check for required environment variables
  if (!process.env.SLING_EMAIL) {
    console.error('❌ Error: SLING_EMAIL not set in .env file');
    process.exit(1);
  }

  if (!process.env.SLING_PASSWORD) {
    console.error('❌ Error: SLING_PASSWORD not set in .env file');
    process.exit(1);
  }

  const server = process.env.SLING_SERVER || 'api';

  console.log('Configuration:');
  console.log(`  Email: ${process.env.SLING_EMAIL}`);
  console.log(`  Password: ${'*'.repeat(process.env.SLING_PASSWORD.length)}`);
  console.log(`  Server: ${server}.getsling.com`);
  console.log();
  console.log('Attempting to authenticate...');
  console.log();

  try {
    const token = await loginToSling({
      email: process.env.SLING_EMAIL,
      password: process.env.SLING_PASSWORD,
      server: server,
    });

    console.log();
    console.log('='.repeat(60));
    console.log('✅ SUCCESS! Authentication successful');
    console.log('='.repeat(60));
    console.log();
    console.log('Token received:', token.substring(0, 50) + '...');
    console.log('Token length:', token.length, 'characters');
    console.log();
    console.log('Your credentials are working correctly! 🎉');
    console.log('You can now use this MCP server with Claude.');

  } catch (error) {
    console.log();
    console.log('='.repeat(60));
    console.log('❌ FAILED! Authentication failed');
    console.log('='.repeat(60));
    console.log();
    console.error('Error:', error.message);
    console.log();
    console.log('Debug information is shown above (stderr output).');
    console.log('Please check:');
    console.log('  1. Your email and password are correct');
    console.log('  2. You can log in to https://app.getsling.com');
    console.log('  3. Your account is not locked or suspended');
    console.log();
    console.log('For more help, see TROUBLESHOOTING.md');

    process.exit(1);
  }
}

testAuth();
