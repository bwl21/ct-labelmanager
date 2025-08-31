// ChurchTools API Service
export interface ChurchToolsConfig {
  baseUrl: string;
  username: string;
  password: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  description?: string;
  domainType: string;
  domainId?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    count?: number;
    pagination?: {
      current: number;
      limit: number;
      total: number;
    };
  };
}

export class ChurchToolsApiService {
  private config: ChurchToolsConfig;
  private apiToken: string | null = null;
  private loginToken: string | null = null;
  private personId: number | null = null;

  constructor(config: ChurchToolsConfig) {
    this.config = config;
    this.loadStoredToken();
  }

  // Load stored token from localStorage
  private loadStoredToken(): void {
    try {
      const stored = localStorage.getItem('churchtools_login_token');
      if (stored) {
        const tokenData = JSON.parse(stored);
        if (tokenData.expires > Date.now()) {
          this.loginToken = tokenData.token;
          this.personId = tokenData.personId;
          console.log('Loaded stored login token');
        } else {
          localStorage.removeItem('churchtools_login_token');
          console.log('Stored token expired, removed');
        }
      }
    } catch (error) {
      console.error('Error loading stored token:', error);
      localStorage.removeItem('churchtools_login_token');
    }
  }

  // Store token in localStorage
  private storeToken(token: string, personId: number, expiresInHours: number = 24): void {
    try {
      const tokenData = {
        token,
        personId,
        expires: Date.now() + (expiresInHours * 60 * 60 * 1000)
      };
      localStorage.setItem('churchtools_login_token', JSON.stringify(tokenData));
      console.log('Stored login token');
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Clear stored token
  private clearStoredToken(): void {
    localStorage.removeItem('churchtools_login_token');
    this.loginToken = null;
    this.personId = null;
  }

  // Check if we have a valid stored token
  async checkStoredToken(): Promise<boolean> {
    if (!this.loginToken) return false;
    
    try {
      // Test the stored token with a simple API call
      const response = await fetch(`${this.config.baseUrl}/api/whoami`, {
        headers: {
          'Authorization': `Login ${this.loginToken}`,
          'Accept': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('Stored token is valid');
        this.apiToken = this.loginToken;
        return true;
      } else {
        console.log('Stored token is invalid, clearing');
        this.clearStoredToken();
        return false;
      }
    } catch (error) {
      console.error('Error checking stored token:', error);
      this.clearStoredToken();
      return false;
    }
  }

  // Authenticate with ChurchTools and get login token
  async authenticate(): Promise<boolean> {
    try {
      // First check if we have a valid stored token
      if (await this.checkStoredToken()) {
        return true;
      }
      
      console.log('Attempting authentication with:', this.config.baseUrl);
      
      // Step 1: Login with username/password to get session
      const loginResponse = await fetch(`${this.config.baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password
        })
      });

      const loginResponseText = await loginResponse.text();
      let loginData;
      
      try {
        loginData = JSON.parse(loginResponseText);
      } catch (e) {
        console.error('Invalid JSON response from login:', loginResponseText);
        throw new Error('Invalid response from server');
      }

      if (!loginResponse.ok) {
        const errorMessage = loginData.message || loginData.error || `HTTP ${loginResponse.status}: ${loginResponse.statusText}`;
        console.error('Login failed:', loginData);
        throw new Error(errorMessage);
      }

      // Extract person ID from login response
      let personId = null;
      if (loginData.data && loginData.data.personId) {
        personId = loginData.data.personId;
      } else if (loginData.data && loginData.data.id) {
        personId = loginData.data.id;
      }

      if (!personId) {
        console.error('No person ID in login response:', loginData);
        throw new Error('Could not get person ID from login');
      }

      console.log('Login successful, person ID:', personId);

      // Step 2: Request login token
      const tokenResponse = await fetch(`${this.config.baseUrl}/api/persons/${personId}/logintoken`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      const tokenResponseText = await tokenResponse.text();
      let tokenData;
      
      try {
        tokenData = JSON.parse(tokenResponseText);
      } catch (e) {
        console.error('Invalid JSON response from token request:', tokenResponseText);
        throw new Error('Invalid response from token request');
      }

      if (!tokenResponse.ok) {
        const errorMessage = tokenData.message || tokenData.error || `HTTP ${tokenResponse.status}: ${tokenResponse.statusText}`;
        console.error('Token request failed:', tokenData);
        throw new Error(`Token request failed: ${errorMessage}`);
      }

      // Extract token from response
      let token = null;
      if (tokenData.data && tokenData.data.token) {
        token = tokenData.data.token;
      } else if (tokenData.token) {
        token = tokenData.token;
      } else if (tokenData.data && typeof tokenData.data === 'string') {
        token = tokenData.data;
      }

      if (!token) {
        console.error('No token in response:', tokenData);
        throw new Error('No login token received');
      }

      // Store token and set as current API token
      this.loginToken = token;
      this.apiToken = token;
      this.personId = personId;
      this.storeToken(token, personId);
      
      console.log('Authentication successful, login token received and stored');
      return true;

    } catch (error) {
      console.error('Authentication error:', error);
      this.clearStoredToken();
      
      // Check for CORS or network issues
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Cannot connect to ChurchTools. Please check the URL and your internet connection.');
      }
      
      throw error;
    }
  }

  // Logout and clear tokens
  async logout(): Promise<void> {
    try {
      if (this.loginToken) {
        // Try to revoke the token on the server
        await fetch(`${this.config.baseUrl}/api/persons/${this.personId}/logintoken`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Login ${this.loginToken}`,
            'Accept': 'application/json',
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Error revoking token:', error);
    } finally {
      this.clearStoredToken();
      this.apiToken = null;
      console.log('Logged out and cleared tokens');
    }
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.apiToken !== null;
  }

  // Get current person ID
  getPersonId(): number | null {
    return this.personId;
  }

  // Get authentication headers
  private getAuthHeaders(): HeadersInit {
    if (!this.apiToken) {
      throw new Error('Not authenticated');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    // Use Login token format for ChurchTools API
    if (this.apiToken !== 'session-based') {
      headers['Authorization'] = `Login ${this.apiToken}`;
    }
    
    return headers;
  }

  // Generic API request method
  private async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}/api${endpoint}`;
    const headers = {
      ...this.getAuthHeaders(),
      'Accept': 'application/json',
      ...options.headers
    };

    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Invalid JSON response:', responseText);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('API Error:', data);
      throw new Error(errorMessage);
    }

    return data;
  }

  // Fetch all tags
  async fetchTags(type: 'persons' | 'songs' = 'persons'): Promise<Tag[]> {
    try {
      const response = await this.apiRequest<Tag[]>(`/tags?type=${type}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  // Fetch tags for persons
  async fetchPersonTags(): Promise<Tag[]> {
    return this.fetchTags('persons');
  }

  // Fetch tags for songs
  async fetchSongTags(): Promise<Tag[]> {
    return this.fetchTags('songs');
  }

  // Fetch all tag types
  async fetchAllTags(): Promise<{ persons: Tag[], songs: Tag[] }> {
    try {
      const [persons, songs] = await Promise.all([
        this.fetchPersonTags(),
        this.fetchSongTags()
      ]);
      return { persons, songs };
    } catch (error) {
      console.error('Error fetching all tags:', error);
      throw error;
    }
  }

  // Fetch a specific tag by ID
  async fetchTag(id: number): Promise<Tag> {
    try {
      const response = await this.apiRequest<Tag>(`/tags/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tag ${id}:`, error);
      throw error;
    }
  }

  // Create a new tag
  async createTag(tag: Omit<Tag, 'id'>, type: 'persons' | 'songs' = 'persons'): Promise<Tag> {
    try {
      const response = await this.apiRequest<Tag>(`/tags?type=${type}`, {
        method: 'POST',
        body: JSON.stringify(tag)
      });
      return response.data;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }

  // Update an existing tag
  async updateTag(id: number, tag: Partial<Tag>, type: 'persons' | 'songs' = 'persons'): Promise<Tag> {
    try {
      const response = await this.apiRequest<Tag>(`/tags/${id}?type=${type}`, {
        method: 'PUT',
        body: JSON.stringify(tag)
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating tag ${id}:`, error);
      throw error;
    }
  }

  // Delete a tag
  async deleteTag(id: number, type: 'persons' | 'songs' = 'persons'): Promise<void> {
    try {
      await this.apiRequest<void>(`/tags/${id}?type=${type}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Error deleting tag ${id}:`, error);
      throw error;
    }
  }

  // Get available domain types (if supported by API)
  async getDomainTypes(): Promise<string[]> {
    try {
      // This might not be available in all ChurchTools versions
      const response = await this.apiRequest<string[]>('/tags/domains');
      return response.data || ['person', 'group', 'event', 'resource', 'service'];
    } catch (error) {
      // Fallback to common domain types
      console.warn('Could not fetch domain types, using defaults:', error);
      return ['person', 'group', 'event', 'resource', 'service'];
    }
  }

  // Search tags by name
  async searchTags(query: string): Promise<Tag[]> {
    try {
      const response = await this.apiRequest<Tag[]>(`/tags?search=${encodeURIComponent(query)}`);
      return response.data || [];
    } catch (error) {
      console.error('Error searching tags:', error);
      throw error;
    }
  }

  // Get tags by domain type
  async getTagsByDomain(domainType: string): Promise<Tag[]> {
    try {
      const response = await this.apiRequest<Tag[]>(`/tags?domainType=${encodeURIComponent(domainType)}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching tags for domain ${domainType}:`, error);
      throw error;
    }
  }
}