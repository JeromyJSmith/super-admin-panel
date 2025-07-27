import { createClient } from '@supabase/supabase-js';
import type { SupabaseTable, SupabaseMetrics, ApiResponse } from '../../types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export class SupabaseService {
  private client;
  private adminClient;

  constructor() {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key are required');
    }
    
    this.client = createClient(supabaseUrl, supabaseKey);
    this.adminClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : this.client;
  }

  async testConnection(): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await this.client.from('_supabase_admin').select('*').limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is fine
        return { success: false, error: error.message };
      }
      
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: 'Failed to connect to Supabase' };
    }
  }

  async getTables(): Promise<ApiResponse<SupabaseTable[]>> {
    try {
      const { data, error } = await this.adminClient
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_type', 'BASE TABLE')
        .not('table_schema', 'in', '(information_schema,pg_catalog,auth,storage,realtime,supabase_functions)');

      if (error) {
        return { success: false, error: error.message };
      }

      const tables: SupabaseTable[] = data?.map(table => ({
        name: table.table_name,
        schema: table.table_schema,
        rowCount: 0, // We'll get this separately
        size: '0 KB',
        lastModified: new Date().toISOString()
      })) || [];

      return { success: true, data: tables };
    } catch (error) {
      return { success: false, error: 'Failed to fetch tables' };
    }
  }

  async getTableRowCount(tableName: string): Promise<number> {
    try {
      const { count, error } = await this.client
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`Error getting row count for ${tableName}:`, error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error(`Error getting row count for ${tableName}:`, error);
      return 0;
    }
  }

  async getMetrics(): Promise<ApiResponse<SupabaseMetrics>> {
    try {
      const tablesResponse = await this.getTables();
      if (!tablesResponse.success || !tablesResponse.data) {
        return { success: false, error: 'Failed to fetch tables for metrics' };
      }

      let totalRows = 0;
      const tables = tablesResponse.data;

      // Get row counts for each table (this might take a while for large databases)
      for (const table of tables.slice(0, 10)) { // Limit to first 10 tables for performance
        const rowCount = await this.getTableRowCount(table.name);
        totalRows += rowCount;
      }

      const metrics: SupabaseMetrics = {
        totalRows,
        totalTables: tables.length,
        databaseSize: '0 MB', // This would require admin queries
        activeConnections: 1, // This would require admin queries
        queriesPerSecond: 0, // This would require admin queries
      };

      return { success: true, data: metrics };
    } catch (error) {
      return { success: false, error: 'Failed to fetch metrics' };
    }
  }

  async executeQuery(query: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await this.adminClient.rpc('execute_sql', { query });
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to execute query' };
    }
  }

  async getRecentActivity(): Promise<ApiResponse<any[]>> {
    try {
      // This would require custom logging or audit tables
      // For now, return mock data
      const activities = [
        {
          id: '1',
          action: 'INSERT',
          table: 'users',
          timestamp: new Date().toISOString(),
          details: 'New user registered'
        },
        {
          id: '2',
          action: 'UPDATE',
          table: 'profiles',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          details: 'Profile updated'
        }
      ];

      return { success: true, data: activities };
    } catch (error) {
      return { success: false, error: 'Failed to fetch recent activity' };
    }
  }
}
