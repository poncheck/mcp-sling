import axios from 'axios';

export interface SlingAuthConfig {
  email?: string;
  password?: string;
  token?: string; // Pre-obtained token (recommended due to captcha requirements)
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
  private usePreObtainedToken: boolean = false;

  constructor(config: SlingAuthConfig) {
    this.config = config;

    // If a token is provided directly, use it
    if (config.token) {
      this.token = config.token.trim();
      this.usePreObtainedToken = true;
      // Tokens from browser typically last weeks/months
      // Set a very long expiry (30 days), user can manually refresh if needed
      this.tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      console.error('Using pre-obtained token from configuration');
    } else if (!config.email || !config.password) {
      throw new Error(
        'Either provide a token (SLING_TOKEN) or email+password (SLING_EMAIL and SLING_PASSWORD)'
      );
    }
  }

  async getToken(): Promise<string> {
    // If using a pre-obtained token, just return it
    if (this.usePreObtainedToken && this.token) {
      return this.token;
    }

    // Check if we have a valid cached token
    if (this.token && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.token;
    }

    // Login and get a new token
    if (!this.config.email || !this.config.password) {
      throw new Error('Email and password are required for login-based authentication');
    }

    this.token = await loginToSling({
      email: this.config.email,
      password: this.config.password,
      server: this.config.server,
    });

    // Sling tokens typically expire after some time, we'll refresh proactively
    // Set expiry to 1 hour from now (you may need to adjust based on actual token lifetime)
    this.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    return this.token;
  }

  /**
   * Force a token refresh
   * Note: This will not work if using a pre-obtained token
   */
  async refreshToken(): Promise<string> {
    if (this.usePreObtainedToken) {
      throw new Error(
        'Cannot refresh a pre-obtained token. Please get a new token from your browser.'
      );
    }
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
