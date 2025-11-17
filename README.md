# MCP Sling Server

Model Context Protocol (MCP) server for the Sling API - a comprehensive scheduling and workforce management platform.

> **Quick Start:** New to this? See [QUICK_START.md](./QUICK_START.md) for a 5-minute setup guide!

## Features

This MCP server provides tools to interact with all major Sling API endpoints:

### Calendar & Scheduling
- **get_calendar** - Retrieve calendar and shift data for users
- **create_shift** - Create new shifts for employees
- **get_timesheets** - View timesheet data and actual hours worked
- **update_timesheet** - Modify timesheet entries

### User Management
- **get_users** - List all users in your organization
- **create_user** - Add new users
- **update_user** - Modify user information

### Organization Management
- **get_organization** - View organization details
- **get_organization_by_id** - Get specific organization info
- **switch_organization** - Switch between organizations
- **get_groups** - List organizational groups

### Reporting & Analytics
- **get_reports** - Access various reports (labor, schedule, attendance)
- **create_sales_record** - Record sales data for analytics
- **get_tags** - Retrieve available tags for categorization

### Settings
- **update_settings** - Modify organization or user settings

### Advanced
- **sling_api_call** - Make custom API calls to any Sling endpoint

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd mcp-sling
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Get your Sling authorization token:

**IMPORTANT:** Due to CAPTCHA requirements on the Sling login endpoint, you need to obtain your authorization token from your browser.

Follow the detailed guide: **[TOKEN_GUIDE.md](./TOKEN_GUIDE.md)**

5. Create a `.env` file with your token:
```bash
cp .env.example .env
```

Edit `.env` and add your token:
```env
SLING_TOKEN=your-token-from-browser
SLING_SERVER=api
```

## Configuration

### Environment Variables

**Recommended approach (avoids CAPTCHA):**
- **SLING_TOKEN** (required) - Your Sling authorization token from browser
  - See [TOKEN_GUIDE.md](./TOKEN_GUIDE.md) for instructions
- **SLING_SERVER** (optional) - API server to use (default: "api", use "test-api" for staging)

**Alternative (requires CAPTCHA - not recommended):**
- **SLING_EMAIL** - Your Sling account email
- **SLING_PASSWORD** - Your Sling account password
- Note: Currently not working due to CAPTCHA requirement on `/account/login` endpoint

### Claude Desktop Configuration

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

**Recommended: Using token**
```json
{
  "mcpServers": {
    "sling": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-sling/dist/index.js"],
      "env": {
        "SLING_TOKEN": "your-token-from-browser"
      }
    }
  }
}
```

**Alternative: Using .env file**
```json
{
  "mcpServers": {
    "sling": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-sling/dist/index.js"]
    }
  }
}
```
(Requires `.env` file with `SLING_TOKEN` configured)

## Usage Examples

Once configured, you can use the Sling tools through Claude. Here are some example queries:

### Get All Users
```
Can you get the list of all users in my Sling organization?
```

### View Calendar
```
Show me the calendar for user ID 12345 in organization 67890 for dates 2024-01-15
```

### Create a Shift
```
Create a shift for user 12345 starting at 2024-01-20T09:00:00Z and ending at 2024-01-20T17:00:00Z for the "Cashier" position
```

### Get Reports
```
Get the labor report for the period from 2024-01-01 to 2024-01-31
```

### Custom API Call
```
Make a GET request to /custom/endpoint with params {"filter": "active"}
```

## Authentication

This server handles authentication automatically using your configured credentials. The authentication flow:

1. On first request, the server logs in to Sling using your email/password
2. The authentication token is cached and reused for subsequent requests
3. If a token expires (401 error), the server automatically refreshes it
4. Tokens are typically valid for 1 hour

Note: The Sling API uses email/password authentication as documented in their [official examples](https://github.com/getsling/getsling-api-docs).

### About CAPTCHA

**Important Update:** As of November 2024, Sling has added CAPTCHA protection to the `/account/login` API endpoint. This means direct email/password authentication no longer works without solving a CAPTCHA challenge.

**Solution:** Use a pre-obtained authorization token from your browser instead. See [TOKEN_GUIDE.md](./TOKEN_GUIDE.md) for detailed instructions.

**Why this approach works:**
- Tokens obtained from browser sessions don't require CAPTCHA
- Tokens typically remain valid for weeks or months
- You only need to get a new token when it expires or you change your password
- This is the recommended approach until Sling provides an alternative API authentication method

## API Documentation

For detailed information about the Sling API endpoints and data formats, refer to:
- [Official Sling API Docs](https://api.getsling.com/)
- [Sling API GitHub Repository](https://github.com/getsling/getsling-api-docs)

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

### Run Development Server
```bash
npm run dev
```

### Test Authentication

To verify your credentials work before using with Claude:

```bash
node test-auth.js
```

This will attempt to authenticate and show detailed debug information.

## Permissions

Your API access level matches your Sling user permissions:
- **Admin tokens** - Full access to all organization data
- **Employee tokens** - Limited to that user's information only

## Troubleshooting

### "No authorization token received from Sling API"

The server now includes detailed debug logging. Check your MCP server logs (Claude Desktop Developer Console) for:
- Response status code
- Response headers
- Response body

This will help identify where the token should be.

**Quick fixes:**
1. Verify credentials in `.env` are correct (no extra quotes/spaces)
2. Test login with curl:
   ```bash
   curl -i -X POST https://api.getsling.com/account/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your@email.com","password":"password"}'
   ```
3. Look for `authorization:` header in the response

**For detailed troubleshooting steps, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

### Authentication Issues
- Verify your email and password are correct in `.env`
- Check that you can log in to Sling web app with these credentials
- Ensure you're using the correct server (api vs test-api)
- Make sure you're not using OAuth provider credentials (Google/Facebook)

### API Errors
- Check the error message for specific details
- Verify your user has permission to access the requested resource
- Ensure date formats are in ISO 8601 format (e.g., "2024-01-20T09:00:00Z")

### Connection Issues
- Verify you have internet connectivity
- Check if api.getsling.com is accessible
- Try using SLING_SERVER=test-api for the staging environment

### Debugging

The server logs detailed authentication information to stderr:
- All response headers from Sling API
- Response body content
- Token extraction attempts

View these logs in:
- **Claude Desktop**: Help → Developer Tools → Console
- **Terminal**: stderr output from the MCP server process

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues with:
- **This MCP server**: Open an issue in this repository
- **Sling API**: Refer to [Sling API documentation](https://github.com/getsling/getsling-api-docs)
- **MCP Protocol**: See [MCP documentation](https://modelcontextprotocol.io/)
