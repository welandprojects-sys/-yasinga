// Replit Auth API client - no configuration needed
// Auth is handled by server-side routes

// Helper for making authenticated API requests
export const apiClient = {
  get: (url: string) => fetch(url, { credentials: 'include' }),
  post: (url: string, data?: any) => 
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    }),
  put: (url: string, data?: any) => 
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    }),
  delete: (url: string) => 
    fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    })
};
