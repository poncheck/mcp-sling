#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import { SlingAuthManager } from './auth.js';
import { SlingClient } from './client.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
// Either SLING_TOKEN or (SLING_EMAIL + SLING_PASSWORD) must be provided
const hasToken = !!process.env.SLING_TOKEN;
const hasCredentials = !!(process.env.SLING_EMAIL && process.env.SLING_PASSWORD);

if (!hasToken && !hasCredentials) {
  throw new Error(
    'Missing required environment variables. ' +
    'Provide either SLING_TOKEN or both SLING_EMAIL and SLING_PASSWORD'
  );
}

// Initialize auth manager and client
const authManager = new SlingAuthManager({
  token: process.env.SLING_TOKEN,
  email: process.env.SLING_EMAIL,
  password: process.env.SLING_PASSWORD,
  server: process.env.SLING_SERVER || 'api',
});

const client = new SlingClient({
  authManager,
  server: process.env.SLING_SERVER || 'api',
});

// Define all available tools
const TOOLS: Tool[] = [
  // Calendar tools
  {
    name: 'get_calendar',
    description: 'Get calendar information for a specific user in an organization. Returns schedule and shift data for the specified date range.',
    inputSchema: {
      type: 'object',
      properties: {
        org: {
          type: 'string',
          description: 'Organization identifier',
        },
        user: {
          type: 'string',
          description: 'User identifier',
        },
        dates: {
          type: 'string',
          description: 'Date parameter (e.g., "2024-01-01" or date range)',
        },
      },
      required: ['org', 'user', 'dates'],
    },
  },

  // Users tools
  {
    name: 'get_users',
    description: 'Get list of users in the organization. Returns user information based on your access level.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_user',
    description: 'Create a new user in the organization.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'User email address',
        },
        name: {
          type: 'string',
          description: 'User full name',
        },
        role: {
          type: 'string',
          description: 'User role (e.g., "employee", "manager", "admin")',
        },
        data: {
          type: 'object',
          description: 'Additional user data as JSON object',
        },
      },
      required: ['email', 'name'],
    },
  },
  {
    name: 'update_user',
    description: 'Update an existing user in the organization.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User identifier',
        },
        data: {
          type: 'object',
          description: 'User data to update as JSON object',
        },
      },
      required: ['userId', 'data'],
    },
  },

  // Organization tools
  {
    name: 'get_organization',
    description: 'Get organization information. Returns details about your organization.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_organization_by_id',
    description: 'Get organization information by specific organization ID.',
    inputSchema: {
      type: 'object',
      properties: {
        orgId: {
          type: 'string',
          description: 'Organization identifier',
        },
      },
      required: ['orgId'],
    },
  },
  {
    name: 'switch_organization',
    description: 'Switch to a different organization context.',
    inputSchema: {
      type: 'object',
      properties: {
        orgId: {
          type: 'string',
          description: 'Organization identifier to switch to',
        },
      },
      required: ['orgId'],
    },
  },

  // Groups tools
  {
    name: 'get_groups',
    description: 'Get list of groups in the organization. Groups are used to organize users.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // Shifts tools
  {
    name: 'create_shift',
    description: 'Create a new shift for a user. Shifts represent scheduled work periods.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User identifier who will work this shift',
        },
        startTime: {
          type: 'string',
          description: 'Shift start time (ISO 8601 format)',
        },
        endTime: {
          type: 'string',
          description: 'Shift end time (ISO 8601 format)',
        },
        position: {
          type: 'string',
          description: 'Position/role for this shift',
        },
        location: {
          type: 'string',
          description: 'Location where the shift takes place',
        },
        data: {
          type: 'object',
          description: 'Additional shift data as JSON object',
        },
      },
      required: ['userId', 'startTime', 'endTime'],
    },
  },

  // Timesheets tools
  {
    name: 'get_timesheets',
    description: 'Get timesheet data. Timesheets track actual hours worked.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date for timesheet query (ISO 8601 format)',
        },
        endDate: {
          type: 'string',
          description: 'End date for timesheet query (ISO 8601 format)',
        },
        userId: {
          type: 'string',
          description: 'Optional: Filter by specific user',
        },
      },
    },
  },
  {
    name: 'update_timesheet',
    description: 'Update timesheet data for a user.',
    inputSchema: {
      type: 'object',
      properties: {
        timesheetId: {
          type: 'string',
          description: 'Timesheet identifier',
        },
        data: {
          type: 'object',
          description: 'Timesheet data to update as JSON object',
        },
      },
      required: ['timesheetId', 'data'],
    },
  },

  // Reports tools
  {
    name: 'get_reports',
    description: 'Get reports data. Reports provide analytics and insights about schedules, labor costs, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        reportType: {
          type: 'string',
          description: 'Type of report to retrieve (e.g., "labor", "schedule", "attendance")',
        },
        startDate: {
          type: 'string',
          description: 'Start date for report (ISO 8601 format)',
        },
        endDate: {
          type: 'string',
          description: 'End date for report (ISO 8601 format)',
        },
        params: {
          type: 'object',
          description: 'Additional report parameters',
        },
      },
    },
  },

  // Tags tools
  {
    name: 'get_tags',
    description: 'Get list of available tags. Tags are used to categorize and organize shifts, users, etc.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // Sales tools
  {
    name: 'create_sales_record',
    description: 'Create a sales record. Used for tracking sales data and labor analytics.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date of the sale (ISO 8601 format)',
        },
        amount: {
          type: 'number',
          description: 'Sale amount',
        },
        location: {
          type: 'string',
          description: 'Location where the sale occurred',
        },
        data: {
          type: 'object',
          description: 'Additional sales data as JSON object',
        },
      },
      required: ['date', 'amount'],
    },
  },

  // Settings tools
  {
    name: 'update_settings',
    description: 'Update organization or user settings.',
    inputSchema: {
      type: 'object',
      properties: {
        settingType: {
          type: 'string',
          description: 'Type of setting to update (e.g., "organization", "user", "notifications")',
        },
        data: {
          type: 'object',
          description: 'Settings data to update as JSON object',
        },
      },
      required: ['settingType', 'data'],
    },
  },

  // Generic API call tool for advanced users
  {
    name: 'sling_api_call',
    description: 'Make a custom API call to any Sling endpoint. Use this for endpoints not covered by specific tools.',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
          description: 'HTTP method to use',
        },
        path: {
          type: 'string',
          description: 'API endpoint path (e.g., "/users", "/calendar/123/users/456")',
        },
        params: {
          type: 'object',
          description: 'Query parameters for GET requests',
        },
        data: {
          type: 'object',
          description: 'Request body data for POST/PUT requests',
        },
      },
      required: ['method', 'path'],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: 'mcp-sling',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      // Calendar
      case 'get_calendar': {
        const { org, user, dates } = args as { org: string; user: string; dates: string };
        const data = await client.get(`/calendar/${org}/users/${user}`, { dates });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // Users
      case 'get_users': {
        const data = await client.get('/users');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'create_user': {
        const userData = args as any;
        const data = await client.post('/users', userData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'update_user': {
        const { userId, data: updateData } = args as { userId: string; data: any };
        const data = await client.put(`/users/${userId}`, updateData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // Organization
      case 'get_organization': {
        const data = await client.get('/org');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_organization_by_id': {
        const { orgId } = args as { orgId: string };
        const data = await client.get(`/org/${orgId}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'switch_organization': {
        const { orgId } = args as { orgId: string };
        const data = await client.put('/switch_org', { orgId });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // Groups
      case 'get_groups': {
        const data = await client.get('/groups');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // Shifts
      case 'create_shift': {
        const shiftData = args as any;
        const data = await client.post('/shifts', shiftData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // Timesheets
      case 'get_timesheets': {
        const params = args as any;
        const data = await client.get('/timesheets', params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'update_timesheet': {
        const { timesheetId, data: updateData } = args as { timesheetId: string; data: any };
        const data = await client.put(`/timesheets/${timesheetId}`, updateData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // Reports
      case 'get_reports': {
        const { reportType, ...params } = args as any;
        const path = reportType ? `/reports/${reportType}` : '/reports';
        const data = await client.get(path, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // Tags
      case 'get_tags': {
        const data = await client.get('/tags');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // Sales
      case 'create_sales_record': {
        const salesData = args as any;
        const data = await client.post('/sales', salesData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // Settings
      case 'update_settings': {
        const { settingType, data: settingsData } = args as { settingType: string; data: any };
        const data = await client.put(`/settings/${settingType}`, settingsData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      // Generic API call
      case 'sling_api_call': {
        const { method, path, params, data: requestData } = args as {
          method: 'GET' | 'POST' | 'PUT' | 'DELETE';
          path: string;
          params?: any;
          data?: any;
        };

        let data;
        switch (method) {
          case 'GET':
            data = await client.get(path, params);
            break;
          case 'POST':
            data = await client.post(path, requestData);
            break;
          case 'PUT':
            data = await client.put(path, requestData);
            break;
          case 'DELETE':
            data = await client.delete(path);
            break;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Sling MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
