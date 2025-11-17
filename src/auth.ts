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

    // Debug: log response details
    console.error('Login response status:', response.status);
    console.error('Login response headers:', JSON.stringify(response.headers, null, 2));
    console.error('Login response data:', JSON.stringify(response.data, null, 2));

    // Check if login was successful
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Login failed with status ${response.status}: ${JSON.stringify(response.data)}`
      );
    }

    // The authorization token can be in several places:
    // 1. response.headers['authorization'] (lowercase, as axios normalizes headers)
    // 2. response.headers['Authorization'] (original case)
    // 3. response.data.token or response.data.authorization (in body)
    let authToken =
      response.headers['authorization'] ||
      response.headers['Authorization'] ||
      (response.data && typeof response.data === 'object' && (
        response.data.token ||
        response.data.authorization ||
        response.data.auth ||
        response.data.authToken
      ));

    if (!authToken) {
      // If still no token, throw detailed error
      throw new Error(
        `No authorization token received from Sling API. ` +
        `Status: ${response.status}, ` +
        `Headers: ${JSON.stringify(response.headers)}, ` +
        `Body: ${JSON.stringify(response.data)}`
      );
    }

    // Remove any whitespace from the token
    return authToken.trim().replace(/[\t\r\n ]/g, '');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data,
      };

      throw new Error(
        `Failed to authenticate with Sling API: ${JSON.stringify(errorDetails, null, 2)}`
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
