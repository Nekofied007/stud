import axios from 'axios'

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds
})

// Request interceptor for adding auth tokens (future use)
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add JWT token from localStorage when auth is implemented
    // const token = localStorage.getItem('auth_token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // TODO: Redirect to login when auth is implemented
          console.error('Unauthorized access')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error:', data.detail || 'Internal server error')
          break
        default:
          console.error('API error:', data.detail || error.message)
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: No response from server')
    } else {
      // Error in request setup
      console.error('Request error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
