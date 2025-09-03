
import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://llwshsrhvsjxnjaotafb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsd3Noc3JodnNqeG5qYW90YWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzMzODEsImV4cCI6MjA3MTg0OTM4MX0.K8MUrt60zIdyfx6FhW05KfoUxASBcky_K5K-cviygA4';

console.log('Environment check:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? 'present' : 'missing' });

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API client for making requests to our Express backend
export const apiClient = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`/api${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  post: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  put: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`/api${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await fetch(`/api${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  },
};
