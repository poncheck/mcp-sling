# Sling MCP Server - Usage Examples

This document provides detailed examples of how to use the Sling MCP server tools.

## Getting Started

First, ensure you have configured the server in Claude Desktop. Once connected, you can interact with your Sling organization using natural language.

## Calendar & Scheduling Examples

### Viewing a User's Calendar

**Query:**
```
Show me the calendar for user 12345 in organization 67890 for January 15, 2024
```

**What happens:**
The server calls `get_calendar` with:
- org: "67890"
- user: "12345"
- dates: "2024-01-15"

### Creating a Shift

**Query:**
```
Create a morning shift for user 12345 on January 20, 2024 from 9 AM to 5 PM for the Cashier position at Store #1
```

**What happens:**
The server calls `create_shift` with:
```json
{
  "userId": "12345",
  "startTime": "2024-01-20T09:00:00Z",
  "endTime": "2024-01-20T17:00:00Z",
  "position": "Cashier",
  "location": "Store #1"
}
```

### Viewing Timesheets

**Query:**
```
Get all timesheets for last week
```

**What happens:**
The server calls `get_timesheets` with calculated date range.

## User Management Examples

### Listing All Users

**Query:**
```
Show me all users in the organization
```

**What happens:**
The server calls `get_users` and returns the complete user list.

### Creating a New User

**Query:**
```
Add a new employee named John Doe with email john.doe@example.com as an employee role
```

**What happens:**
The server calls `create_user` with:
```json
{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "role": "employee"
}
```

### Updating User Information

**Query:**
```
Update user 12345 to change their role to manager
```

**What happens:**
The server calls `update_user` with:
```json
{
  "userId": "12345",
  "data": {
    "role": "manager"
  }
}
```

## Organization Examples

### Getting Organization Info

**Query:**
```
What are my organization details?
```

**What happens:**
The server calls `get_organization` and returns organization information including name, settings, and configuration.

### Switching Organizations

**Query:**
```
Switch to organization 99999
```

**What happens:**
The server calls `switch_organization` with orgId "99999", changing your current organization context.

### Viewing Groups

**Query:**
```
Show me all groups in the organization
```

**What happens:**
The server calls `get_groups` to list all organizational groups.

## Reporting Examples

### Labor Report

**Query:**
```
Generate a labor report for January 2024
```

**What happens:**
The server calls `get_reports` with:
```json
{
  "reportType": "labor",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### Adding Sales Data

**Query:**
```
Record a sale of $1,250.50 for today at Store #1
```

**What happens:**
The server calls `create_sales_record` with:
```json
{
  "date": "2024-01-15T00:00:00Z",
  "amount": 1250.50,
  "location": "Store #1"
}
```

## Advanced Examples

### Custom API Call

**Query:**
```
Make a GET request to /custom/endpoint with the parameter status=active
```

**What happens:**
The server calls `sling_api_call` with:
```json
{
  "method": "GET",
  "path": "/custom/endpoint",
  "params": {
    "status": "active"
  }
}
```

### Complex Workflow

**Query:**
```
I need to:
1. Get all users
2. Find users with the role "manager"
3. Create a shift for each manager tomorrow from 9 AM to 6 PM
```

**What happens:**
Claude will:
1. Call `get_users` to retrieve all users
2. Filter the results for managers
3. For each manager, call `create_shift` with appropriate parameters

## Working with Dates

The Sling API uses ISO 8601 date format. Here are some examples:

- **Date only**: `2024-01-15`
- **Date and time**: `2024-01-15T09:00:00Z`
- **Date range**: Typically specified as separate startDate and endDate parameters

When you provide dates in natural language (e.g., "next Monday", "last week"), Claude will convert them to the proper ISO format.

## Error Handling

If an operation fails, the server will return an error message. Common errors include:

### Authentication Error
```
Error: Sling API Error (401): Unauthorized
```
**Solution**: Check your credentials in .env file

### Permission Error
```
Error: Sling API Error (403): Forbidden - insufficient permissions
```
**Solution**: Your user account doesn't have permission for this operation. Admin privileges may be required.

### Not Found Error
```
Error: Sling API Error (404): Resource not found
```
**Solution**: Verify that the user ID, organization ID, or other identifiers are correct.

### Validation Error
```
Error: Sling API Error (400): Bad Request - invalid data
```
**Solution**: Check that all required fields are provided and properly formatted.

## Tips for Best Results

1. **Be specific**: Provide exact IDs when you know them
2. **Use natural language**: Claude understands context and can translate your requests
3. **Check permissions**: Some operations require admin access
4. **Date formats**: You can use natural language for dates; Claude will convert them
5. **Batch operations**: You can ask Claude to perform multiple operations in sequence

## Common Workflows

### Weekly Schedule Review

```
Show me all shifts for this week, grouped by user
```

### Payroll Preparation

```
Get all timesheets for the past two weeks and summarize total hours per employee
```

### Staff Management

```
List all employees, their roles, and their availability this week
```

### Performance Analysis

```
Get the labor report for last month and calculate the labor cost percentage
```

## Need Help?

If you're unsure what operations are available, you can ask:

```
What can you do with the Sling API?
```

Claude will explain the available tools and their capabilities.
