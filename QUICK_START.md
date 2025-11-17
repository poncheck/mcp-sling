# Quick Start Guide

Get up and running with MCP Sling in 5 minutes!

## Prerequisites

- Node.js installed (v18 or higher recommended)
- A Sling account at https://app.getsling.com
- Access to your browser's developer tools

## Step 1: Install

```bash
git clone <repository-url>
cd mcp-sling
npm install
npm run build
```

## Step 2: Get Your Token

### Why do I need to do this?

Sling now requires CAPTCHA for API login, so we can't use email/password directly. Instead, we'll grab your auth token from the browser - it's quick and easy!

### How to get it:

1. **Log in to Sling** at https://app.getsling.com

2. **Open Developer Tools:**
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Win) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+I` (Win) / `Cmd+Option+I` (Mac)
   - Safari: `Cmd+Option+I` (enable in Preferences → Advanced first)

3. **Go to Network tab**, refresh the page

4. **Filter by `api.getsling`** to see only API requests

5. **Click on any API request** to `api.getsling.com`

6. **Find the `Authorization` header** in the request headers

7. **Copy the entire token value** (including "Token" if present)

Example:
```
Authorization: Token abc123def456ghi789...
```

👉 **Need more help?** See [TOKEN_GUIDE.md](./TOKEN_GUIDE.md) for detailed instructions with screenshots.

## Step 3: Configure

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and paste your token:

```env
SLING_TOKEN=Token abc123def456ghi789...
SLING_SERVER=api
```

## Step 4: Add to Claude Desktop

Edit your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

Add this:

```json
{
  "mcpServers": {
    "sling": {
      "command": "node",
      "args": ["/FULL/PATH/TO/mcp-sling/dist/index.js"],
      "env": {
        "SLING_TOKEN": "Token abc123def456ghi789..."
      }
    }
  }
}
```

**Important:** Replace `/FULL/PATH/TO/` with the actual absolute path!

## Step 5: Restart Claude Desktop

Completely quit and restart Claude Desktop for the changes to take effect.

## Step 6: Test It!

Ask Claude:

```
Can you get my Sling organization details?
```

or

```
Show me all users in my Sling organization
```

If it works, you'll see data from your Sling account! 🎉

## Troubleshooting

### "401 Unauthorized"
Your token expired or is invalid. Get a new one from the browser (Step 2).

### "Missing required environment variables"
Make sure you have `SLING_TOKEN` set in either:
- Your `.env` file, OR
- Claude Desktop config under `env`

### Claude doesn't see the MCP server
1. Check the path in Claude config is absolute (starts with `/` or `C:\`)
2. Restart Claude Desktop completely
3. Check Claude Desktop logs in Developer Console

### Still having issues?
See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed help.

## What's Next?

### Available Tools

Now you can ask Claude to:

**Scheduling:**
- Get calendar and shift data
- Create new shifts
- View timesheets

**Users:**
- List all users
- Create new users
- Update user information

**Organization:**
- Get organization details
- Switch between organizations
- View groups

**Reports:**
- Generate labor reports
- Add sales data
- View analytics

**And more!** See [EXAMPLES.md](./EXAMPLES.md) for detailed usage examples.

### Example Queries

Try asking Claude:

- "Show me all shifts scheduled for next week"
- "Create a shift for user 12345 tomorrow from 9 AM to 5 PM"
- "Get the labor report for last month"
- "Who are all the managers in my organization?"
- "What's on the schedule for today?"

## Token Maintenance

### How long does my token last?

Tokens typically last **weeks to months**. You'll know it expired when you get 401 errors.

### When to get a new token:

- When you get "401 Unauthorized" errors
- After changing your Sling password
- After logging out from all sessions

### Getting a new token:

Just repeat Step 2 - it takes 30 seconds! Update your `.env` or Claude config with the new token.

## Security Notes

⚠️ **Important:**
- Your token has the same permissions as your Sling user account
- Keep your token secret (don't commit `.env` to git)
- Don't share your token with others
- Treat it like a password!

## Need Help?

- **Token issues:** [TOKEN_GUIDE.md](./TOKEN_GUIDE.md)
- **Errors:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Usage examples:** [EXAMPLES.md](./EXAMPLES.md)
- **Full docs:** [README.md](./README.md)

---

**Enjoy using MCP Sling!** 🚀

If you encounter any issues, please check the troubleshooting guide or open an issue in the repository.
