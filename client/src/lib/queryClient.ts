
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Add authorization header if user is logged in
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const response = await fetch(url, {
          headers,
        });

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
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Add authorization header if user is logged in
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const response = await fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
    },
  },
});

export default queryClient;
