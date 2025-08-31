import type { Tag } from '../types'

export interface ApiConfig {
  baseUrl: string
}

export class ChurchToolsApi {
  private config: ApiConfig
  private sessionCookie: string | null = null
  private loginToken: string | null = null
  private apiToken: string | null = null
  private personId: number | null = null

  constructor(config: ApiConfig) {
    this.config = config
  }

  // Store token in localStorage
  private storeToken(token: string, personId: number): void {
    localStorage.setItem('ct_login_token', token)
    localStorage.setItem('ct_person_id', personId.toString())
  }

  // Clear stored token
  private clearStoredToken(): void {
    localStorage.removeItem('ct_login_token')
    localStorage.removeItem('ct_person_id')
  }

  // Set stored token (for initialization)
  setStoredToken(token: string, personId: number): void {
    this.loginToken = token
    this.apiToken = token
    this.personId = personId
  }

  // Verify if current authentication is valid
  async verifyAuthentication(): Promise<boolean> {
    if (!this.apiToken) return false
    
    try {
      const response = await fetch(`${this.config.baseUrl}/api/whoami`, {
        headers: {
          'Authorization': `Login ${this.apiToken}`,
          'Accept': 'application/json',
        },
        credentials: 'include'
      })
      
      return response.ok
    } catch {
      return false
    }
  }

  // Authenticate with username and password
  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      // Step 1: Login with credentials
      const loginResponse = await fetch(`${this.config.baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username,
          password: password
        })
      })

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}))
        throw new Error(errorData.message || `Login failed: ${loginResponse.status} ${loginResponse.statusText}`)
      }

      const loginData = await loginResponse.json()
      console.log('Login response:', loginData)

      // Extract session cookie
      const setCookieHeader = loginResponse.headers.get('set-cookie')
      if (setCookieHeader) {
        const sessionMatch = setCookieHeader.match(/ChurchTools-([^=]+)=([^;]+)/)
        if (sessionMatch) {
          this.sessionCookie = `${sessionMatch[0]}`
        }
      }

      // Get person ID from response
      const personId = loginData.data?.personId || loginData.personId
      if (!personId) {
        console.error('No person ID in login response:', loginData)
        throw new Error('Could not get person ID from login')
      }

      console.log('Login successful, person ID:', personId)

      // Step 2: Request login token
      const tokenResponse = await fetch(`${this.config.baseUrl}/api/persons/${personId}/logintoken`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include'
      })

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get login token: ${tokenResponse.status} ${tokenResponse.statusText}`)
      }

      const tokenData = await tokenResponse.json()
      console.log('Token response:', tokenData)

      let token: string | null = null

      // Handle different response formats
      if (tokenData.data && tokenData.data.token) {
        token = tokenData.data.token
      } else if (tokenData.token) {
        token = tokenData.token
      } else if (tokenData.data && typeof tokenData.data === 'string') {
        token = tokenData.data
      }

      if (!token) {
        console.error('No token in response:', tokenData)
        throw new Error('No login token received')
      }

      // Store token and set as current API token
      this.loginToken = token
      this.apiToken = token
      this.personId = personId
      this.storeToken(token, personId)
      
      console.log('Authentication successful, login token received and stored')
      return true

    } catch (error) {
      console.error('Authentication error:', error)
      this.clearStoredToken()
      
      // Check for CORS or network issues
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Cannot connect to ChurchTools. Please check the URL and your internet connection.')
      }
      
      throw error
    }
  }

  // Logout and clear tokens
  async logout(): Promise<void> {
    try {
      if (this.loginToken && this.personId) {
        // Try to revoke the token on the server
        await fetch(`${this.config.baseUrl}/api/persons/${this.personId}/logintoken`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Login ${this.loginToken}`,
            'Accept': 'application/json',
          },
          credentials: 'include'
        })
      }
    } catch (error) {
      console.error('Error revoking token:', error)
    } finally {
      // Always clear local state
      this.sessionCookie = null
      this.loginToken = null
      this.apiToken = null
      this.personId = null
      this.clearStoredToken()
    }
  }

  // Make authenticated API request
  private async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> {
    const url = `${this.config.baseUrl}/api${endpoint}`
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    }

    if (this.apiToken) {
      headers['Authorization'] = `Login ${this.apiToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    })

    const responseText = await response.text()
    let data

    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Invalid JSON response:', responseText)
      throw new Error('Invalid response from server')
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
      console.error('API Error:', data)
      throw new Error(errorMessage)
    }

    return data
  }

  // Fetch all tags
  async fetchTags(type: 'persons' | 'songs' = 'persons'): Promise<Tag[]> {
    try {
      const response = await this.apiRequest<Tag[]>(`/tags?type=${type}`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching tags:', error)
      throw error
    }
  }

  // Fetch tags for persons
  async fetchPersonTags(): Promise<Tag[]> {
    return this.fetchTags('persons')
  }

  // Fetch tags for songs
  async fetchSongTags(): Promise<Tag[]> {
    return this.fetchTags('songs')
  }

  // Fetch all tag types
  async fetchAllTags(): Promise<{ persons: Tag[], songs: Tag[] }> {
    try {
      const [persons, songs] = await Promise.all([
        this.fetchPersonTags(),
        this.fetchSongTags()
      ])
      return { persons, songs }
    } catch (error) {
      console.error('Error fetching all tags:', error)
      throw error
    }
  }

  // Fetch a specific tag by ID
  async fetchTag(id: number): Promise<Tag> {
    try {
      const response = await this.apiRequest<Tag>(`/tags/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching tag ${id}:`, error)
      throw error
    }
  }

  // Create a new tag
  async createTag(tag: Omit<Tag, 'id'>, type: 'persons' | 'songs' = 'persons'): Promise<Tag> {
    try {
      const response = await this.apiRequest<Tag>(`/tags?type=${type}`, {
        method: 'POST',
        body: JSON.stringify(tag)
      })
      return response.data
    } catch (error) {
      console.error('Error creating tag:', error)
      throw error
    }
  }

  // Update an existing tag
  async updateTag(id: number, tag: Partial<Tag>, type: 'persons' | 'songs' = 'persons'): Promise<Tag> {
    try {
      const response = await this.apiRequest<Tag>(`/tags/${id}?type=${type}`, {
        method: 'PUT',
        body: JSON.stringify(tag)
      })
      return response.data
    } catch (error) {
      console.error(`Error updating tag ${id}:`, error)
      throw error
    }
  }

  // Delete a tag
  async deleteTag(id: number, type: 'persons' | 'songs' = 'persons'): Promise<void> {
    try {
      await this.apiRequest(`/tags/${id}?type=${type}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error(`Error deleting tag ${id}:`, error)
      throw error
    }
  }
}