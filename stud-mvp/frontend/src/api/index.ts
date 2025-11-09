// Central export for all API functions
export * from './client'
export * from './ingest'
export * from './transcribe'
export * from './quiz'
export * from './tutor'

// Health check endpoint
import apiClient from './client'

export interface HealthResponse {
  status: string
  version?: string
  timestamp?: string
}

export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health')
  return response.data
}
