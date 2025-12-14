import axios, { type AxiosInstance } from "axios";
import { ZohoAuthenticationError } from "../errors.js";

/**
 * Configuration for the token manager
 */
export interface TokenManagerConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accountsUrl: string;
}

/**
 * OAuth token response from Zoho
 */
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds
  api_domain?: string;
}

/**
 * Manages OAuth 2.0 tokens for Zoho Projects API
 *
 * Features:
 * - Client credentials flow
 * - Automatic token refresh before expiry (at 55 minutes)
 * - Promise deduplication to prevent concurrent refresh requests
 */
export class TokenManager {
  private accessToken: string | null = null;
  private expiresAt: number = 0;
  private refreshPromise: Promise<string> | null = null;
  private httpClient: AxiosInstance;

  constructor(private readonly config: TokenManagerConfig) {
    this.httpClient = axios.create({
      baseURL: config.accountsUrl,
      timeout: 30000,
    });
  }

  /**
   * Get a valid access token, refreshing if necessary
   * Safe to call concurrently - only one refresh request will be made
   */
  async getValidToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.accessToken!;
    }
    return this.refreshToken();
  }

  /**
   * Check if the current token is valid
   * Returns false if token is null or within 5 minutes of expiry
   */
  private isTokenValid(): boolean {
    if (!this.accessToken) {
      return false;
    }
    // Refresh 5 minutes before expiry
    const bufferMs = 5 * 60 * 1000;
    return Date.now() < this.expiresAt - bufferMs;
  }

  /**
   * Refresh the access token
   * Uses promise deduplication to prevent concurrent refresh requests
   * This is critical for multi-instance deployments
   */
  private async refreshToken(): Promise<string> {
    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start a new refresh
    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh request
   */
  private async doRefresh(): Promise<string> {
    try {
      const response = await this.httpClient.post<TokenResponse>(
        "/oauth/v2/token",
        null,
        {
          params: {
            grant_type: "refresh_token",
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            refresh_token: this.config.refreshToken,
          },
        }
      );

      const data = response.data;

      if (!data.access_token) {
        throw new ZohoAuthenticationError(
          "No access token in response"
        );
      }

      this.accessToken = data.access_token;
      // Set expiry time - tokens are valid for 1 hour (3600 seconds)
      this.expiresAt = Date.now() + data.expires_in * 1000;

      return this.accessToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { error?: string })?.error ||
          error.message;
        throw new ZohoAuthenticationError(
          `Failed to obtain access token: ${message}`,
          error
        );
      }
      throw new ZohoAuthenticationError(
        `Failed to obtain access token: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Invalidate the current token
   * Useful when receiving 401 responses to force a refresh
   */
  invalidate(): void {
    this.accessToken = null;
    this.expiresAt = 0;
  }

  /**
   * Get token expiry time for debugging/monitoring
   */
  getExpiresAt(): number {
    return this.expiresAt;
  }

  /**
   * Get remaining validity in milliseconds
   */
  getRemainingValidityMs(): number {
    if (!this.accessToken) {
      return 0;
    }
    return Math.max(0, this.expiresAt - Date.now());
  }
}
