// API Integration Service - Multi-Application Integration Framework

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Integration Configuration Types
export interface ApiIntegrationConfig {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'soap' | 'webhook';
  baseUrl: string;
  version: string;
  description: string;
  category: 'erp' | 'crm' | 'accounting' | 'inventory' | 'supply-chain' | 'analytics' | 'ecommerce' | 'custom';
  authentication: {
    method: 'basic' | 'bearer' | 'api-key' | 'oauth2' | 'custom';
    credentials: {
      username?: string;
      password?: string;
      apiKey?: string;
      token?: string;
      clientId?: string;
      clientSecret?: string;
      refreshToken?: string;
    };
    headers?: Record<string, string>;
  };
  endpoints: ApiEndpoint[];
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  isActive: boolean;
  lastSync: Date;
  syncInterval: number; // in minutes
  status: 'active' | 'error' | 'disabled' | 'syncing';
  errorCount: number;
  lastError?: string;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters?: ApiParameter[];
  responseMapping?: Record<string, string>;
  dataTransformation?: DataTransformationRule[];
  isActive: boolean;
  lastUsed: Date;
  successCount: number;
  errorCount: number;
}

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface DataTransformationRule {
  id: string;
  name: string;
  type: 'field-mapping' | 'data-filter' | 'data-aggregation' | 'data-enrichment' | 'custom';
  sourceField: string;
  targetField: string;
  transformation: string; // JSONPath, regex, or custom function
  isActive: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: Date;
  requestId: string;
  metadata?: {
    totalRecords?: number;
    pageSize?: number;
    currentPage?: number;
    hasMore?: boolean;
  };
}

export interface IntegrationData {
  id: string;
  integrationId: string;
  endpointId: string;
  data: any;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// Pre-configured Integration Templates
export const INTEGRATION_TEMPLATES: Partial<ApiIntegrationConfig>[] = [
  {
    name: 'SAP ERP',
    type: 'rest',
    category: 'erp',
    description: 'SAP ERP system integration for inventory, purchasing, and financial data',
    authentication: {
      method: 'basic',
      credentials: {}
    },
    endpoints: [
      {
        id: 'sap-materials',
        name: 'Get Materials',
        path: '/api/materials',
        method: 'GET',
        description: 'Retrieve material master data from SAP',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      },
      {
        id: 'sap-inventory',
        name: 'Get Inventory',
        path: '/api/inventory',
        method: 'GET',
        description: 'Retrieve current inventory levels',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      },
      {
        id: 'sap-purchase-orders',
        name: 'Get Purchase Orders',
        path: '/api/purchase-orders',
        method: 'GET',
        description: 'Retrieve purchase order data',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      }
    ]
  },
  {
    name: 'Tandem Financial',
    type: 'rest',
    category: 'accounting',
    description: 'Tandem financial management system integration',
    authentication: {
      method: 'api-key',
      credentials: {}
    },
    endpoints: [
      {
        id: 'tandem-accounts',
        name: 'Get Chart of Accounts',
        path: '/api/accounts',
        method: 'GET',
        description: 'Retrieve chart of accounts',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      },
      {
        id: 'tandem-transactions',
        name: 'Get Financial Transactions',
        path: '/api/transactions',
        method: 'GET',
        description: 'Retrieve financial transactions',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      },
      {
        id: 'tandem-reports',
        name: 'Get Financial Reports',
        path: '/api/reports',
        method: 'GET',
        description: 'Retrieve financial reports',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      }
    ]
  },
  {
    name: 'Salesforce CRM',
    type: 'rest',
    category: 'crm',
    description: 'Salesforce CRM integration for customer and sales data',
    authentication: {
      method: 'oauth2',
      credentials: {}
    },
    endpoints: [
      {
        id: 'sf-accounts',
        name: 'Get Accounts',
        path: '/services/data/v52.0/sobjects/Account',
        method: 'GET',
        description: 'Retrieve customer accounts',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      },
      {
        id: 'sf-opportunities',
        name: 'Get Opportunities',
        path: '/services/data/v52.0/sobjects/Opportunity',
        method: 'GET',
        description: 'Retrieve sales opportunities',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      }
    ]
  },
  {
    name: 'QuickBooks',
    type: 'rest',
    category: 'accounting',
    description: 'QuickBooks accounting system integration',
    authentication: {
      method: 'oauth2',
      credentials: {}
    },
    endpoints: [
      {
        id: 'qb-items',
        name: 'Get Items',
        path: '/v3/company/{realmId}/item',
        method: 'GET',
        description: 'Retrieve QuickBooks items',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      },
      {
        id: 'qb-invoices',
        name: 'Get Invoices',
        path: '/v3/company/{realmId}/invoice',
        method: 'GET',
        description: 'Retrieve QuickBooks invoices',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      }
    ]
  },
  {
    name: 'Shopify',
    type: 'rest',
    category: 'ecommerce',
    description: 'Shopify e-commerce platform integration',
    authentication: {
      method: 'api-key',
      credentials: {}
    },
    endpoints: [
      {
        id: 'shopify-products',
        name: 'Get Products',
        path: '/admin/api/2023-10/products.json',
        method: 'GET',
        description: 'Retrieve Shopify products',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      },
      {
        id: 'shopify-orders',
        name: 'Get Orders',
        path: '/admin/api/2023-10/orders.json',
        method: 'GET',
        description: 'Retrieve Shopify orders',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      }
    ]
  },
  {
    name: 'Microsoft Dynamics',
    type: 'rest',
    category: 'erp',
    description: 'Microsoft Dynamics ERP integration',
    authentication: {
      method: 'oauth2',
      credentials: {}
    },
    endpoints: [
      {
        id: 'dynamics-products',
        name: 'Get Products',
        path: '/api/data/v9.2/products',
        method: 'GET',
        description: 'Retrieve Dynamics products',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      },
      {
        id: 'dynamics-customers',
        name: 'Get Customers',
        path: '/api/data/v9.2/accounts',
        method: 'GET',
        description: 'Retrieve Dynamics customers',
        isActive: true,
        lastUsed: new Date(),
        successCount: 0,
        errorCount: 0
      }
    ]
  }
];

class ApiIntegrationService {
  private integrations: Map<string, ApiIntegrationConfig> = new Map();
  private axiosInstances: Map<string, AxiosInstance> = new Map();
  private dataCache: Map<string, IntegrationData[]> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDefaultIntegrations();
  }

  private initializeDefaultIntegrations() {
    // Initialize with template configurations
    INTEGRATION_TEMPLATES.forEach((template, index) => {
      const config: ApiIntegrationConfig = {
        id: `integration_${index + 1}`,
        name: template.name || `Integration ${index + 1}`,
        type: template.type || 'rest',
        baseUrl: '',
        version: '1.0',
        description: template.description || '',
        category: template.category || 'custom',
        authentication: template.authentication || {
          method: 'api-key',
          credentials: {}
        },
        endpoints: template.endpoints || [],
        isActive: false,
        lastSync: new Date(),
        syncInterval: 30,
        status: 'disabled',
        errorCount: 0
      };
      
      this.integrations.set(config.id, config);
    });
  }

  // Configuration Management
  async addIntegration(config: Omit<ApiIntegrationConfig, 'id' | 'lastSync' | 'status' | 'errorCount'>): Promise<string> {
    const id = `integration_${Date.now()}`;
    const integration: ApiIntegrationConfig = {
      ...config,
      id,
      lastSync: new Date(),
      status: 'disabled',
      errorCount: 0
    };

    this.integrations.set(id, integration);
    await this.setupAxiosInstance(id);
    return id;
  }

  async updateIntegration(id: string, updates: Partial<ApiIntegrationConfig>): Promise<void> {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error(`Integration ${id} not found`);
    }

    const updatedIntegration = { ...integration, ...updates };
    this.integrations.set(id, updatedIntegration);
    
    if (updates.baseUrl || updates.authentication) {
      await this.setupAxiosInstance(id);
    }
  }

  async removeIntegration(id: string): Promise<void> {
    this.stopSync(id);
    this.integrations.delete(id);
    this.axiosInstances.delete(id);
    this.dataCache.delete(id);
  }

  async getIntegration(id: string): Promise<ApiIntegrationConfig | null> {
    return this.integrations.get(id) || null;
  }

  async getAllIntegrations(): Promise<ApiIntegrationConfig[]> {
    return Array.from(this.integrations.values());
  }

  // Axios Instance Management
  private async setupAxiosInstance(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (!integration) return;

    const config: AxiosRequestConfig = {
      baseURL: integration.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Inventory-Platform/1.0'
      }
    };

    // Add authentication headers
    if (integration.authentication.headers) {
      Object.assign(config.headers || {}, integration.authentication.headers);
    }

    const axiosInstance = axios.create(config);

    // Add request interceptor for authentication
    axiosInstance.interceptors.request.use(async (config) => {
      const auth = integration.authentication;
      
      switch (auth.method) {
        case 'basic':
          if (auth.credentials.username && auth.credentials.password) {
            const credentials = btoa(`${auth.credentials.username}:${auth.credentials.password}`);
            config.headers.Authorization = `Basic ${credentials}`;
          }
          break;
        case 'bearer':
          if (auth.credentials.token) {
            config.headers.Authorization = `Bearer ${auth.credentials.token}`;
          }
          break;
        case 'api-key':
          if (auth.credentials.apiKey) {
            config.headers['X-API-Key'] = auth.credentials.apiKey;
          }
          break;
        case 'oauth2':
          // Handle OAuth2 token refresh if needed
          if (auth.credentials.token) {
            config.headers.Authorization = `Bearer ${auth.credentials.token}`;
          }
          break;
      }

      return config;
    });

    // Add response interceptor for error handling
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const integration = this.integrations.get(integrationId);
        if (integration) {
          integration.errorCount++;
          integration.lastError = error.message;
          this.integrations.set(integrationId, integration);
        }
        return Promise.reject(error);
      }
    );

    this.axiosInstances.set(integrationId, axiosInstance);
  }

  // Data Synchronization
  async startSync(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    if (integration.status === 'syncing') {
      throw new Error(`Integration ${integrationId} is already syncing`);
    }

    integration.status = 'syncing';
    integration.isActive = true;
    this.integrations.set(integrationId, integration);

    // Start periodic sync
    const interval = setInterval(async () => {
      await this.syncIntegration(integrationId);
    }, integration.syncInterval * 60 * 1000);

    this.syncIntervals.set(integrationId, interval);

    // Initial sync
    await this.syncIntegration(integrationId);
  }

  async stopSync(integrationId: string): Promise<void> {
    const interval = this.syncIntervals.get(integrationId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(integrationId);
    }

    const integration = this.integrations.get(integrationId);
    if (integration) {
      integration.status = 'disabled';
      integration.isActive = false;
      this.integrations.set(integrationId, integration);
    }
  }

  private async syncIntegration(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (!integration || !integration.isActive) return;

    try {
      integration.status = 'syncing';
      this.integrations.set(integrationId, integration);

      const axiosInstance = this.axiosInstances.get(integrationId);
      if (!axiosInstance) {
        throw new Error('Axios instance not found');
      }

      const syncResults: IntegrationData[] = [];

      // Sync each active endpoint
      for (const endpoint of integration.endpoints.filter(e => e.isActive)) {
        try {
          const response = await this.callEndpoint(integrationId, endpoint.id);
          
          const integrationData: IntegrationData = {
            id: `data_${Date.now()}_${endpoint.id}`,
            integrationId,
            endpointId: endpoint.id,
            data: response.data,
            timestamp: new Date(),
            status: 'success',
            metadata: {
              statusCode: response.statusCode,
              requestId: response.requestId
            }
          };

          syncResults.push(integrationData);
          endpoint.successCount++;
          endpoint.lastUsed = new Date();

        } catch (error) {
          const errorData: IntegrationData = {
            id: `error_${Date.now()}_${endpoint.id}`,
            integrationId,
            endpointId: endpoint.id,
            data: null,
            timestamp: new Date(),
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            metadata: {
              requestId: `req_${Date.now()}`
            }
          };

          syncResults.push(errorData);
          endpoint.errorCount++;
        }
      }

      // Update cache
      const existingData = this.dataCache.get(integrationId) || [];
      this.dataCache.set(integrationId, [...existingData, ...syncResults]);

      // Update integration status
      integration.status = 'active';
      integration.lastSync = new Date();
      integration.errorCount = 0;
      this.integrations.set(integrationId, integration);

    } catch (error) {
      const integration = this.integrations.get(integrationId);
      if (integration) {
        integration.status = 'error';
        integration.errorCount++;
        integration.lastError = error instanceof Error ? error.message : 'Unknown error';
        this.integrations.set(integrationId, integration);
      }
    }
  }

  // Endpoint Calling
  async callEndpoint(integrationId: string, endpointId: string, parameters?: Record<string, any>): Promise<ApiResponse> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    const endpoint = integration.endpoints.find(e => e.id === endpointId);
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointId} not found`);
    }

    const axiosInstance = this.axiosInstances.get(integrationId);
    if (!axiosInstance) {
      throw new Error('Axios instance not found');
    }

    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      let url = endpoint.path;
      let requestConfig: AxiosRequestConfig = {};

      // Handle parameters
      if (parameters) {
        if (endpoint.method === 'GET') {
          requestConfig.params = parameters;
        } else {
          requestConfig.data = parameters;
        }
      }

      const response = await axiosInstance.request({
        method: endpoint.method,
        url,
        ...requestConfig
      });

      // Apply data transformations
      let transformedData = response.data;
      if (endpoint.dataTransformation) {
        transformedData = this.applyDataTransformations(response.data, endpoint.dataTransformation);
      }

      return {
        success: true,
        data: transformedData,
        statusCode: response.status,
        timestamp: new Date(),
        requestId,
        metadata: {
          totalRecords: Array.isArray(transformedData) ? transformedData.length : undefined
        }
      };

    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: error.response?.status || 500,
        timestamp: new Date(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }
  }

  // Data Transformation
  private applyDataTransformations(data: any, transformations: DataTransformationRule[]): any {
    let transformedData = data;

    for (const transformation of transformations.filter(t => t.isActive)) {
      try {
        switch (transformation.type) {
          case 'field-mapping':
            transformedData = this.applyFieldMapping(transformedData, transformation);
            break;
          case 'data-filter':
            transformedData = this.applyDataFilter(transformedData, transformation);
            break;
          case 'data-aggregation':
            transformedData = this.applyDataAggregation(transformedData, transformation);
            break;
          case 'data-enrichment':
            transformedData = this.applyDataEnrichment(transformedData, transformation);
            break;
          case 'custom':
            transformedData = this.applyCustomTransformation(transformedData, transformation);
            break;
        }
      } catch (error) {
        console.error(`Error applying transformation ${transformation.id}:`, error);
      }
    }

    return transformedData;
  }

  private applyFieldMapping(data: any, transformation: DataTransformationRule): any {
    if (Array.isArray(data)) {
      return data.map(item => {
        const newItem = { ...item };
        if (item[transformation.sourceField] !== undefined) {
          newItem[transformation.targetField] = item[transformation.sourceField];
          delete newItem[transformation.sourceField];
        }
        return newItem;
      });
    } else {
      const newData = { ...data };
      if (data[transformation.sourceField] !== undefined) {
        newData[transformation.targetField] = data[transformation.sourceField];
        delete newData[transformation.sourceField];
      }
      return newData;
    }
  }

  private applyDataFilter(data: any, transformation: DataTransformationRule): any {
    if (Array.isArray(data)) {
      return data.filter(item => {
        try {
          // Simple filter implementation - can be enhanced with more complex logic
          const filterExpression = transformation.transformation;
          return eval(`item.${filterExpression}`);
        } catch (error) {
          console.error('Filter evaluation error:', error);
          return true;
        }
      });
    }
    return data;
  }

  private applyDataAggregation(data: any, transformation: DataTransformationRule): any {
    if (Array.isArray(data)) {
      // Simple aggregation implementation
      const aggregationType = transformation.transformation;
      const field = transformation.sourceField;
      
      switch (aggregationType) {
        case 'sum':
          return data.reduce((sum, item) => sum + (item[field] || 0), 0);
        case 'average':
          const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
          return data.length > 0 ? sum / data.length : 0;
        case 'count':
          return data.length;
        case 'min':
          return Math.min(...data.map(item => item[field] || Infinity));
        case 'max':
          return Math.max(...data.map(item => item[field] || -Infinity));
        default:
          return data;
      }
    }
    return data;
  }

  private applyDataEnrichment(data: any, transformation: DataTransformationRule): any {
    // Simple enrichment - can be enhanced with external API calls
    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        [transformation.targetField]: transformation.transformation
      }));
    } else {
      return {
        ...data,
        [transformation.targetField]: transformation.transformation
      };
    }
  }

  private applyCustomTransformation(data: any, transformation: DataTransformationRule): any {
    // Custom transformation logic - can be enhanced with more complex transformations
    try {
      const customFunction = new Function('data', transformation.transformation);
      return customFunction(data);
    } catch (error) {
      console.error('Custom transformation error:', error);
      return data;
    }
  }

  // Data Retrieval
  async getIntegrationData(integrationId: string, limit?: number): Promise<IntegrationData[]> {
    const data = this.dataCache.get(integrationId) || [];
    return limit ? data.slice(-limit) : data;
  }

  async getDataByEndpoint(integrationId: string, endpointId: string): Promise<IntegrationData[]> {
    const data = this.dataCache.get(integrationId) || [];
    return data.filter(d => d.endpointId === endpointId);
  }

  async getLatestData(integrationId: string, endpointId?: string): Promise<IntegrationData | null> {
    const data = this.dataCache.get(integrationId) || [];
    const filteredData = endpointId ? data.filter(d => d.endpointId === endpointId) : data;
    return filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;
  }

  // Health and Status
  async getIntegrationHealth(integrationId: string): Promise<{
    status: string;
    lastSync: Date;
    errorCount: number;
    lastError?: string;
    activeEndpoints: number;
    totalEndpoints: number;
  }> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    const activeEndpoints = integration.endpoints.filter(e => e.isActive).length;
    const totalEndpoints = integration.endpoints.length;

    return {
      status: integration.status,
      lastSync: integration.lastSync,
      errorCount: integration.errorCount,
      lastError: integration.lastError,
      activeEndpoints,
      totalEndpoints
    };
  }

  async testConnection(integrationId: string): Promise<boolean> {
    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) return false;

      const axiosInstance = this.axiosInstances.get(integrationId);
      if (!axiosInstance) return false;

      // Test with a simple health check or first endpoint
      const testEndpoint = integration.endpoints.find(e => e.isActive);
      if (!testEndpoint) return false;

      await this.callEndpoint(integrationId, testEndpoint.id);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Utility Methods
  async clearCache(integrationId?: string): Promise<void> {
    if (integrationId) {
      this.dataCache.delete(integrationId);
    } else {
      this.dataCache.clear();
    }
  }

  async getIntegrationStats(): Promise<{
    totalIntegrations: number;
    activeIntegrations: number;
    errorIntegrations: number;
    totalDataRecords: number;
    lastSyncTime: Date;
  }> {
    const integrations = Array.from(this.integrations.values());
    const totalDataRecords = Array.from(this.dataCache.values())
      .reduce((total, data) => total + data.length, 0);

    return {
      totalIntegrations: integrations.length,
      activeIntegrations: integrations.filter(i => i.isActive).length,
      errorIntegrations: integrations.filter(i => i.status === 'error').length,
      totalDataRecords,
      lastSyncTime: new Date(Math.max(...integrations.map(i => i.lastSync.getTime())))
    };
  }
}

// Export singleton instance
export const apiIntegrationService = new ApiIntegrationService(); 