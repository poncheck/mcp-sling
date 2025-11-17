# MCP Sling Server

Model Context Protocol (MCP) server for the Sling API - a comprehensive scheduling and workforce management platform.

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

4. Create a `.env` file with your Sling credentials:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
SLING_EMAIL=your-email@example.com
SLING_PASSWORD=your-password
SLING_SERVER=api
```

## Configuration

### Environment Variables

- **SLING_EMAIL** (required) - Your Sling account email
- **SLING_PASSWORD** (required) - Your Sling account password
- **SLING_SERVER** (optional) - API server to use (default: "api", use "test-api" for staging)

### Claude Desktop Configuration

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sling": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-sling/dist/index.js"],
      "env": {
        "SLING_EMAIL": "your-email@example.com",
        "SLING_PASSWORD": "your-password"
      }
    }
  }
}
```

Alternatively, if you have a `.env` file configured, you can use:

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

## Permissions

Your API access level matches your Sling user permissions:
- **Admin tokens** - Full access to all organization data
- **Employee tokens** - Limited to that user's information only

## Troubleshooting

### Authentication Issues
- Verify your email and password are correct in `.env`
- Check that you can log in to Sling web app with these credentials
- Ensure you're using the correct server (api vs test-api)

### API Errors
- Check the error message for specific details
- Verify your user has permission to access the requested resource
- Ensure date formats are in ISO 8601 format (e.g., "2024-01-20T09:00:00Z")

### Connection Issues
- Verify you have internet connectivity
- Check if api.getsling.com is accessible
- Try using SLING_SERVER=test-api for the staging environment

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues with:
- **This MCP server**: Open an issue in this repository
- **Sling API**: Refer to [Sling API documentation](https://github.com/getsling/getsling-api-docs)
- **MCP Protocol**: See [MCP documentation](https://modelcontextprotocol.io/)
