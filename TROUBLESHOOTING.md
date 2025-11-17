# Troubleshooting Guide

## Common Issues and Solutions

### "No authorization token received from Sling API"

This error occurs when the server cannot extract the authentication token from Sling's response.

#### Debugging Steps:

**1. Check the debug output:**
When authentication fails, the server logs detailed information to stderr:
- Login response status
- All response headers
- Response body

Look for these logs in Claude Desktop's developer console or your terminal.

**2. Verify your credentials:**
```bash
# Test with curl (same method as official Sling examples):
curl -i -X POST https://api.getsling.com/account/login \
  -H "Content-Type: application/json" \
  -H "accept: */*" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

Look for the `authorization:` header in the response.

**3. Common causes:**

**Invalid Credentials:**
- Double-check your email and password in `.env` file
- Make sure there are no extra spaces or quotes
- Verify you can log in to https://app.getsling.com with these credentials

**Account Issues:**
- Your account might be locked or suspended
- You might need admin privileges for API access
- Two-factor authentication might be blocking API access

**Network/Proxy Issues:**
- Check if you can reach api.getsling.com
- Corporate firewall might be blocking the request
- VPN might interfere with authentication

**4. Enable verbose logging:**

The updated auth.ts now logs:
- Response status code
- All response headers
- Response body

Check your MCP server logs to see exactly what Sling is returning.

**5. Test with staging server:**

Try using the test environment:
```env
SLING_SERVER=test-api
```

---

### "Failed to authenticate with Sling API: Error 401"

This means your credentials are incorrect.

**Solutions:**
1. Verify email and password are correct
2. Check for typos in `.env` file
3. Test login through web interface first
4. Make sure you're not using OAuth provider credentials (Google/Facebook)

---

### "Failed to authenticate with Sling API: Error 403"

This means access is forbidden.

**Possible causes:**
- Your account doesn't have API access enabled
- Account is restricted or suspended
- IP address might be blocked
- Rate limiting is in effect

**Solutions:**
1. Contact Sling support to enable API access
2. Wait a few minutes if rate-limited
3. Check your account status

---

### "Failed to authenticate with Sling API: Error 500"

This is a server error on Sling's side.

**Solutions:**
1. Wait a few minutes and try again
2. Check https://status.getsling.com (if available)
3. Try the staging server (SLING_SERVER=test-api)
4. Report the issue to Sling support

---

## How to Get Detailed Logs

### For Claude Desktop:

1. Open Developer Tools (Help → Developer Tools)
2. Go to Console tab
3. Try authenticating
4. Look for stderr logs from mcp-sling

### For Command Line Testing:

Create a test file `test-auth.js`:

```javascript
import { loginToSling } from './dist/auth.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function test() {
  try {
    const token = await loginToSling({
      email: process.env.SLING_EMAIL,
      password: process.env.SLING_PASSWORD,
      server: process.env.SLING_SERVER || 'api',
    });
    console.log('Success! Token:', token);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
```

Run it:
```bash
node test-auth.js
```

This will show all debug output including headers and response body.

---

## Understanding Token Format

A valid Sling authorization token typically looks like:
```
Token abc123def456...
```

or just:
```
abc123def456...
```

The token should be a long alphanumeric string. If you see HTML content or JSON instead, there might be an issue with the endpoint.

---

## Advanced Debugging

### Check what Sling is actually returning:

```bash
# Verbose curl request
curl -v -X POST https://api.getsling.com/account/login \
  -H "Content-Type: application/json" \
  -H "accept: */*" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}' \
  2>&1 | grep -i authorization
```

### Capture full response:

```bash
# Save response to file
curl -i -X POST https://api.getsling.com/account/login \
  -H "Content-Type: application/json" \
  -H "accept: */*" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}' \
  > response.txt

# Examine the file
cat response.txt
```

Look for:
- HTTP status code (should be 200 or 201)
- `authorization:` header
- Any error messages in the body

---

## Still Having Issues?

If none of the above solutions work:

1. **Share debug output** (remove sensitive data):
   - Response status code
   - Response headers (remove token value)
   - Error message

2. **Verify API access**:
   - Contact Sling support to confirm API is enabled for your account
   - Ask about any account restrictions

3. **Try OAuth** (alternative auth method):
   - OAuth might bypass certain restrictions
   - Requires additional setup with Sling

4. **Check API changes**:
   - Visit https://github.com/getsling/getsling-api-docs/issues
   - Look for recent changes to authentication

---

## Getting Help

- **Sling API Issues**: https://github.com/getsling/getsling-api-docs/issues
- **Sling Support**: Contact through your Sling account
- **MCP Server Issues**: Create an issue in this repository with debug logs
