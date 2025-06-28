import axios, { AxiosInstance } from 'axios';
import { 
  Plant, 
  Product, 
  InventoryItem, 
  StockMovement, 
  AiInsight, 
  User,
  PurchaseOrder,
  Supplier,
  SystemHealth,
  AnalyticsData,
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
  SortOptions
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData: any): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Plants
  async getPlants(filters?: FilterOptions): Promise<ApiResponse<Plant[]>> {
    try {
      const response = await this.api.get('/plants', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPlant(id: string): Promise<ApiResponse<Plant>> {
    try {
      const response = await this.api.get(`/plants/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePlant(id: string, data: Partial<Plant>): Promise<ApiResponse<Plant>> {
    try {
      const response = await this.api.put(`/plants/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Products
  async getProducts(filters?: FilterOptions, sort?: SortOptions): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const response = await this.api.get('/products', { 
        params: { ...filters, ...sort } 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await this.api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createProduct(data: Omit<Product, 'id'>): Promise<ApiResponse<Product>> {
    try {
      const response = await this.api.post('/products', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const response = await this.api.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Inventory
  async getInventory(filters?: FilterOptions): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const response = await this.api.get('/inventory', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateInventory(id: string, data: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    try {
      const response = await this.api.put(`/inventory/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createStockMovement(data: Omit<StockMovement, 'id' | 'timestamp'>): Promise<ApiResponse<StockMovement>> {
    try {
      const response = await this.api.post('/inventory/movements', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStockMovements(filters?: FilterOptions): Promise<ApiResponse<PaginatedResponse<StockMovement>>> {
    try {
      const response = await this.api.get('/inventory/movements', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // AI Insights
  async getAiInsights(filters?: FilterOptions): Promise<ApiResponse<AiInsight[]>> {
    try {
      const response = await this.api.get('/ai/insights', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markInsightAsRead(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.put(`/ai/insights/${id}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateInsight(prompt: string): Promise<ApiResponse<AiInsight>> {
    try {
      const response = await this.api.post('/ai/generate', { prompt });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Analytics
  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    try {
      const response = await this.api.get('/analytics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getChartData(chartType: string, filters?: FilterOptions): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/analytics/charts/${chartType}`, { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // System Health
  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    try {
      const response = await this.api.get('/system/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Purchase Orders
  async getPurchaseOrders(filters?: FilterOptions): Promise<ApiResponse<PaginatedResponse<PurchaseOrder>>> {
    try {
      const response = await this.api.get('/purchase-orders', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'orderDate'>): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const response = await this.api.post('/purchase-orders', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const response = await this.api.put(`/purchase-orders/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Suppliers
  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    try {
      const response = await this.api.get('/suppliers');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createSupplier(data: Omit<Supplier, 'id'>): Promise<ApiResponse<Supplier>> {
    try {
      const response = await this.api.post('/suppliers', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Users
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.api.get('/users');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mock data methods for development
  getMockPlants(): Plant[] {
    return [
      {
        id: 'plant001',
        name: 'Dallas Manufacturing',
        location: 'Dallas, TX',
        type: 'manufacturing',
        efficiency: 94,
        stockLevel: 2847,
        maxCapacity: 5000,
        status: 'optimal',
        timezone: 'America/Chicago',
        manager: 'John Smith',
        contactInfo: {
          phone: '+1-555-0123',
          email: 'dallas@company.com',
          address: '123 Manufacturing Blvd, Dallas, TX 75201'
        },
        operatingHours: {
          start: '06:00',
          end: '18:00',
          timezone: 'America/Chicago'
        }
      },
      {
        id: 'plant002',
        name: 'Chicago Distribution',
        location: 'Chicago, IL',
        type: 'distribution',
        efficiency: 89,
        stockLevel: 1923,
        maxCapacity: 3000,
        status: 'optimal',
        timezone: 'America/Chicago',
        manager: 'Sarah Johnson',
        contactInfo: {
          phone: '+1-555-0124',
          email: 'chicago@company.com',
          address: '456 Distribution Ave, Chicago, IL 60601'
        },
        operatingHours: {
          start: '07:00',
          end: '19:00',
          timezone: 'America/Chicago'
        }
      }
    ];
  }

  getMockProducts(): Product[] {
    return [
      {
        id: 'product001',
        sku: 'SKU-001',
        name: 'Premium Widget',
        category: 'Electronics',
        description: 'High-quality electronic component',
        unit: 'pieces',
        cost: 25.50,
        price: 45.00,
        minStockLevel: 100,
        maxStockLevel: 1000,
        supplier: 'TechCorp Inc',
        leadTime: 14,
        specifications: {
          voltage: '12V',
          current: '2A',
          dimensions: '10x5x2cm'
        }
      },
      {
        id: 'product002',
        sku: 'SKU-002',
        name: 'Industrial Bearing',
        category: 'Mechanical',
        description: 'Heavy-duty industrial bearing',
        unit: 'pieces',
        cost: 15.75,
        price: 28.50,
        minStockLevel: 50,
        maxStockLevel: 500,
        supplier: 'Bearings Plus',
        leadTime: 7,
        specifications: {
          diameter: '50mm',
          load: '5000N',
          material: 'Steel'
        }
      }
    ];
  }

  private handleError(error: any): Error {
    if (error.response) {
      return new Error(error.response.data?.message || 'API request failed');
    } else if (error.request) {
      return new Error('Network error - no response received');
    } else {
      return new Error('Request configuration error');
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 