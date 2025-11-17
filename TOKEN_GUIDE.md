# How to Get Your Sling Authorization Token

Since Sling API now requires CAPTCHA for the `/account/login` endpoint, the recommended approach is to obtain your authorization token directly from your browser.

This token will remain valid for weeks or months, so you only need to do this once.

## Step-by-Step Guide

### Step 1: Log in to Sling

1. Open your browser (Chrome, Firefox, Safari, or Edge)
2. Go to https://app.getsling.com
3. Log in with your Sling credentials

### Step 2: Open Developer Tools

**Chrome / Edge:**
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (Mac)

**Firefox:**
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (Mac)

**Safari:**
- First enable developer tools: Safari → Preferences → Advanced → "Show Develop menu in menu bar"
- Press `Cmd+Option+I`

### Step 3: Go to Network Tab

1. Click on the **Network** tab in the developer tools
2. Make sure recording is enabled (red circle button should be active)

### Step 4: Trigger an API Request

Sling makes API requests automatically, but to ensure you see them:

1. Click on any menu item in Sling (e.g., "Schedule", "Users", "Dashboard")
2. Or simply refresh the page (F5 or Cmd+R)

### Step 5: Find an API Request

In the Network tab, you'll see many requests. Look for requests to:
- `api.getsling.com`
- Endpoints like `/users`, `/calendar`, `/org`, etc.

**Tips:**
- You can filter by typing `api.getsling` in the filter box
- Look for requests with status `200` (successful)

### Step 6: Extract the Authorization Token

1. Click on one of the API requests to `api.getsling.com`
2. Look for the **Request Headers** section (you may need to scroll down)
3. Find the `Authorization:` header
4. Copy the entire token value

**Example:**
```
Authorization: Token abc123def456ghi789jkl012mno345pqr678stu901
```

Copy everything after `Authorization: ` (including "Token" if present)

### Visual Guide

```
Developer Tools → Network Tab
  ↓
Look for: api.getsling.com requests
  ↓
Click on a request
  ↓
Request Headers section
  ↓
Find: Authorization: Token abc123...
  ↓
Copy the entire token value
```

## Alternative Method: Console Method

If you're comfortable with JavaScript, you can use this quick method:

1. Open Developer Tools → **Console** tab
2. Paste this code and press Enter:

```javascript
// Extract token from localStorage or sessionStorage
const token = localStorage.getItem('authToken') ||
              sessionStorage.getItem('authToken') ||
              localStorage.getItem('token') ||
              sessionStorage.getItem('token');

if (token) {
  console.log('Token:', token);
  copy(token); // Copies to clipboard (works in Chrome/Edge)
} else {
  console.log('Token not found in storage. Use Network tab method instead.');
}
```

**Note:** This may or may not work depending on how Sling stores the token.

## Using Your Token

Once you have your token:

1. Open your `.env` file in the mcp-sling directory
2. Add your token:

```env
SLING_TOKEN=Token abc123def456ghi789jkl012mno345pqr678stu901
```

Or in Claude Desktop config:

```json
{
  "mcpServers": {
    "sling": {
      "command": "node",
      "args": ["/path/to/mcp-sling/dist/index.js"],
      "env": {
        "SLING_TOKEN": "Token abc123def456ghi789jkl012mno345pqr678stu901"
      }
    }
  }
}
```

## Token Format

The token typically looks like:
```
Token abc123def456ghi789jkl012mno345pqr678stu901
```

Or sometimes just:
```
abc123def456ghi789jkl012mno345pqr678stu901
```

**Important:** Copy the ENTIRE token, including the word "Token" if it's present.

## How Long is the Token Valid?

- Tokens obtained from the browser typically last **weeks to months**
- The token remains valid as long as you don't:
  - Explicitly log out from all sessions
  - Change your password
  - Have an admin revoke your access

## When to Get a New Token

You'll need to get a new token if:
- The MCP server returns `401 Unauthorized` errors
- You changed your Sling password
- You logged out from all Sling sessions
- The token expires naturally (after weeks/months)

## Security Notes

⚠️ **Keep your token secure!**
- Your token has the same permissions as your user account
- Don't share your token with others
- Don't commit your `.env` file to git (it's in `.gitignore`)
- Treat your token like a password

## Troubleshooting

### "401 Unauthorized" Error

Your token has expired or is invalid. Get a new token following the steps above.

### "Cannot find Authorization header"

- Make sure you're looking at requests to `api.getsling.com` (not `app.getsling.com`)
- Try refreshing the page or clicking different menu items
- Some browsers cache requests; try clearing the Network log and triggering a new request

### Token not working

- Make sure you copied the ENTIRE token (including "Token" prefix if present)
- Check for extra spaces or line breaks
- Verify the token in `.env` has no quotes around it (unless required by your shell)

## Need Help?

If you're having trouble getting your token:
1. Make sure you're logged into Sling successfully
2. Try the Network tab method first (most reliable)
3. Check the TROUBLESHOOTING.md file for more help
4. Open an issue in this repository with details (don't include your actual token!)
