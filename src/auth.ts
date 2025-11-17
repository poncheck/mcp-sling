import axios from 'axios';

export interface SlingAuthConfig {
  email: string;
  password: string;
  server?: string;
}

export interface SlingAuthToken {
  token: string;
  expiresAt?: Date;
}

/**
 * Authenticates with Sling API and returns an authorization token
 * Based on: https://github.com/getsling/getsling-api-docs/blob/develop/examples/bash/login
 */
export async function loginToSling(config: SlingAuthConfig): Promise<string> {
  const server = config.server || 'api';
  const url = `https://${server}.getsling.com/account/login`;

  try {
    const response = await axios.post(
      url,
      {
        email: config.email,
        password: config.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        // We need to capture headers to extract the authorization token
        validateStatus: (status) => status < 500,
      }
    );

    // The authorization token is returned in the response headers
    const authToken = response.headers['authorization'];

    if (!authToken) {
      throw new Error('No authorization token received from Sling API');
    }

    // Remove any whitespace from the token
    return authToken.trim().replace(/[\t\r\n ]/g, '');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to authenticate with Sling API: ${error.message}. ` +
        `Status: ${error.response?.status}, Data: ${JSON.stringify(error.response?.data)}`
      );
    }
    throw error;
  }
}

/**
 * Token manager to handle token caching and refresh
 */
export class SlingAuthManager {
  private token: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private config: SlingAuthConfig;

  constructor(config: SlingAuthConfig) {
    this.config = config;
  }

  async getToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.token;
    }

    // Login and get a new token
    this.token = await loginToSling(this.config);

    // Sling tokens typically expire after some time, we'll refresh proactively
    // Set expiry to 1 hour from now (you may need to adjust based on actual token lifetime)
    this.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    return this.token;
  }

  /**
   * Force a token refresh
   */
  async refreshToken(): Promise<string> {
    this.token = null;
    this.tokenExpiresAt = null;
    return this.getToken();
  }

  /**
   * Clear the cached token
   */
  clearToken(): void {
    this.token = null;
    this.tokenExpiresAt = null;
  }
}
