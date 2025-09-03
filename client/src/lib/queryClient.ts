
import { QueryClient } from "@tanstack/react-query";
import { apiClient } from "./supabase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        
        const response = await apiClient.get(url);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(`401: ${response.statusText} - Unauthorized`);
          }
          throw new Error(`${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (error.message.includes('401')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      mutationFn: async ({ url, method = "POST", data }: any) => {
        let response;
        
        if (method === 'GET') {
          response = await apiClient.get(url);
        } else if (method === 'PUT') {
          response = await apiClient.put(url, data);
        } else if (method === 'DELETE') {
          response = await apiClient.delete(url);
        } else {
          response = await apiClient.post(url, data);
        }

        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
    },
  },
});

// API request utility function
export async function apiRequest(url: string, options: RequestInit = {}) {
  const method = options.method || 'GET';
  let response;
  
  if (method === 'GET') {
    response = await apiClient.get(url);
  } else if (method === 'PUT') {
    const body = options.body ? JSON.parse(options.body as string) : undefined;
    response = await apiClient.put(url, body);
  } else if (method === 'DELETE') {
    response = await apiClient.delete(url);
  } else {
    const body = options.body ? JSON.parse(options.body as string) : undefined;
    response = await apiClient.post(url, body);
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export { queryClient };
export default queryClient;
