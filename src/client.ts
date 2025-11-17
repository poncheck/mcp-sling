import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { SlingAuthManager } from './auth.js';

export interface SlingClientConfig {
  authManager: SlingAuthManager;
  server?: string;
}

/**
 * Sling API Client
 * Handles all API requests with automatic authentication
 */
export class SlingClient {
  private authManager: SlingAuthManager;
  private server: string;
  private axiosInstance: AxiosInstance;

  constructor(config: SlingClientConfig) {
    this.authManager = config.authManager;
    this.server = config.server || 'api';

    this.axiosInstance = axios.create({
      baseURL: `https://${this.server}.getsling.com`,
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make an authenticated GET request
   */
  async get<T = any>(path: string, params?: Record<string, any>): Promise<T> {
    const token = await this.authManager.getToken();

    try {
      const response = await this.axiosInstance.get<T>(path, {
        headers: {
          'Authorization': token,
        },
        params,
      });

      return response.data;
    } catch (error) {
      // If we get a 401, try refreshing the token once
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await this.authManager.refreshToken();
        const response = await this.axiosInstance.get<T>(path, {
          headers: {
            'Authorization': newToken,
          },
          params,
        });
        return response.data;
      }
      throw this.formatError(error);
    }
  }

  /**
   * Make an authenticated POST request
   */
  async post<T = any>(path: string, data?: any): Promise<T> {
    const token = await this.authManager.getToken();

    try {
      const response = await this.axiosInstance.post<T>(path, data, {
        headers: {
          'Authorization': token,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await this.authManager.refreshToken();
        const response = await this.axiosInstance.post<T>(path, data, {
          headers: {
            'Authorization': newToken,
          },
        });
        return response.data;
      }
      throw this.formatError(error);
    }
  }

  /**
   * Make an authenticated PUT request
   */
  async put<T = any>(path: string, data?: any): Promise<T> {
    const token = await this.authManager.getToken();

    try {
      const response = await this.axiosInstance.put<T>(path, data, {
        headers: {
          'Authorization': token,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await this.authManager.refreshToken();
        const response = await this.axiosInstance.put<T>(path, data, {
          headers: {
            'Authorization': newToken,
          },
        });
        return response.data;
      }
      throw this.formatError(error);
    }
  }

  /**
   * Make an authenticated DELETE request
   */
  async delete<T = any>(path: string): Promise<T> {
    const token = await this.authManager.getToken();

    try {
      const response = await this.axiosInstance.delete<T>(path, {
        headers: {
          'Authorization': token,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await this.authManager.refreshToken();
        const response = await this.axiosInstance.delete<T>(path, {
          headers: {
            'Authorization': newToken,
          },
        });
        return response.data;
      }
      throw this.formatError(error);
    }
  }

  private formatError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      const details = error.response?.data ? JSON.stringify(error.response.data) : '';

      return new Error(
        `Sling API Error (${status}): ${message}${details ? ' - ' + details : ''}`
      );
    }
    return error;
  }
}
