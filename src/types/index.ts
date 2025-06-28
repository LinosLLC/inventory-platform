// User Management Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'operator';
  plantAccess: string[];
  avatar?: string;
  lastLogin?: Date;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Plant & Inventory Types
export interface Plant {
  id: string;
  name: string;
  location: string;
  type: 'manufacturing' | 'distribution' | 'assembly' | 'warehouse';
  efficiency: number;
  stockLevel: number;
  maxCapacity: number;
  status: 'optimal' | 'warning' | 'critical';
  timezone: string;
  manager: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  operatingHours: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  cost: number;
  price: number;
  minStockLevel: number;
  maxStockLevel: number;
  supplier: string;
  leadTime: number;
  image?: string;
  specifications: Record<string, any>;
}

export interface InventoryItem {
  id: string;
  productId: string;
  plantId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: Date;
  location: string;
  batchNumber?: string;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'quarantine';
}

export interface StockMovement {
  id: string;
  productId: string;
  plantId: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  reason: string;
  reference: string;
  timestamp: Date;
  userId: string;
  notes?: string;
}

// AI & Analytics Types
export interface AiInsight {
  id: string;
  type: 'forecast' | 'alert' | 'anomaly' | 'optimization' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  plantId?: string;
  productId?: string;
  category: string;
  priority: number;
  isRead: boolean;
  actionRequired: boolean;
  suggestedActions?: string[];
}

export interface Forecast {
  id: string;
  productId: string;
  plantId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  startDate: Date;
  endDate: Date;
  predictedDemand: number[];
  confidenceInterval: {
    lower: number[];
    upper: number[];
  };
  accuracy: number;
  algorithm: 'lstm' | 'arima' | 'prophet' | 'ensemble' | 'transformer' | 'exponential_smoothing';
  lastUpdated: Date;
  seasonality?: {
    detected: boolean;
    period: number;
    strength: number;
    type: 'additive' | 'multiplicative';
  };
  trend?: {
    direction: 'increasing' | 'decreasing' | 'stable';
    slope: number;
    strength: number;
    changePoints: Date[];
  };
  anomalies?: {
    detected: boolean;
    points: Date[];
    severity: number[];
  };
  modelMetrics: {
    mape: number;
    rmse: number;
    mae: number;
    r2: number;
  };
  externalFactors?: {
    weather: number;
    holidays: number;
    events: number;
    economic: number;
  };
  recommendations?: ForecastRecommendation[];
}

export interface ForecastRecommendation {
  id: string;
  type: 'production' | 'procurement' | 'inventory' | 'pricing';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  suggestedAction: string;
  expectedOutcome: string;
  costBenefit?: {
    cost: number;
    benefit: number;
    roi: number;
  };
}

export interface ForecastingConfig {
  id: string;
  name: string;
  algorithm: 'lstm' | 'arima' | 'prophet' | 'ensemble' | 'transformer' | 'exponential_smoothing';
  parameters: Record<string, any>;
  horizon: number;
  confidenceLevel: number;
  seasonalityDetection: boolean;
  anomalyDetection: boolean;
  externalFactors: boolean;
  autoRetrain: boolean;
  retrainInterval: number;
  lastRetrain: Date;
  accuracy: number;
  isActive: boolean;
}

export interface HistoricalData {
  id: string;
  productId: string;
  plantId: string;
  date: Date;
  demand: number;
  supply: number;
  stock: number;
  price: number;
  weather?: {
    temperature: number;
    humidity: number;
    precipitation: number;
  };
  events?: string[];
  holidays?: string[];
  economicIndicators?: {
    gdp: number;
    inflation: number;
    unemployment: number;
    constructionIndex?: number;
    housingStarts?: number;
    buildingPermits?: number;
  };
}

export interface ForecastComparison {
  id: string;
  productId: string;
  plantId: string;
  date: Date;
  actual: number;
  predicted: number;
  algorithm: string;
  error: number;
  percentageError: number;
}

export interface SeasonalAnalysis {
  id: string;
  productId: string;
  plantId: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  year: number;
  averageDemand: number;
  peakDemand: number;
  lowDemand: number;
  seasonalityFactor: number;
  trend: number;
}

export interface TrendAnalysis {
  id: string;
  productId: string;
  plantId: string;
  period: 'short' | 'medium' | 'long';
  startDate: Date;
  endDate: Date;
  direction: 'upward' | 'downward' | 'stable' | 'cyclical';
  slope: number;
  strength: number;
  confidence: number;
  changePoints: Date[];
  seasonality: boolean;
}

export interface AnalyticsData {
  totalStock: number;
  totalValue: number;
  averageEfficiency: number;
  activeInsights: number;
  lowStockItems: number;
  expiringItems: number;
  stockTurnover: number;
  forecastAccuracy: number;
}

// System Integration Types
export interface SystemHealth {
  sap: 'connected' | 'disconnected' | 'warning';
  commerce: 'connected' | 'disconnected' | 'warning';
  legacy: 'connected' | 'disconnected' | 'warning';
  ai: 'optimal' | 'degraded' | 'offline';
  lastChecked: Date;
  responseTime: number;
  errorCount: number;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'sap' | 'commerce' | 'legacy' | 'api';
  endpoint: string;
  credentials: {
    username?: string;
    apiKey?: string;
    token?: string;
  };
  isActive: boolean;
  syncInterval: number;
  lastSync: Date;
  status: 'active' | 'error' | 'disabled';
}

// Supplier & Purchase Types
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  leadTime: number;
  paymentTerms: string;
  isActive: boolean;
  products: string[];
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  plantId: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  notes?: string;
  createdBy: string;
}

export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  userId: string;
  plantId?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Dashboard & Widget Types
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'list';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
  dataSource: string;
  refreshInterval: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// Real-time Types
export interface RealTimeUpdate {
  type: 'stock' | 'efficiency' | 'alert' | 'system';
  plantId?: string;
  productId?: string;
  data: any;
  timestamp: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'manager' | 'operator';
}

export interface ProductForm {
  sku: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  cost: number;
  price: number;
  minStockLevel: number;
  maxStockLevel: number;
  supplier: string;
  leadTime: number;
  specifications: Record<string, any>;
}

// Filter & Search Types
export interface FilterOptions {
  plants?: string[];
  categories?: string[];
  status?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
} 