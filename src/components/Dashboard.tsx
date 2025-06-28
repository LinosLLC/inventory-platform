import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  BarChart3,
  Zap,
  Users,
  Package,
  Settings,
  Bell,
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  Calendar,
  Target,
  TrendingDown,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { realtimeService } from '../services/realtimeService';
import { apiService } from '../services/apiService';
import { forecastingService } from '../services/forecastingService';
import { sapIntegrationService } from '../services/sapIntegrationService';
import AdminPanel from './AdminPanel';
import { 
  Plant, 
  AiInsight, 
  SystemHealth, 
  AnalyticsData,
  Product,
  Notification,
  Forecast,
  ForecastRecommendation
} from '../types';
import './Dashboard.css';

interface DashboardProps {
  onNavigate: (route: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user, logout } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [aiInsights, setAiInsights] = useState<AiInsight[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedPlantInventory, setSelectedPlantInventory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Forecasting state
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [selectedForecastConfig, setSelectedForecastConfig] = useState<string>('construction_ensemble');
  const [forecastRecommendations, setForecastRecommendations] = useState<ForecastRecommendation[]>([]);
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load mock data for now
      const mockPlants = apiService.getMockPlants();
      const mockProducts = apiService.getMockProducts();
      
      setPlants(mockPlants);
      setProducts(mockProducts);
      
      // Mock analytics data
      setAnalytics({
        totalStock: 12157,
        totalValue: 284750.50,
        averageEfficiency: 91,
        activeInsights: 3,
        lowStockItems: 12,
        expiringItems: 5,
        stockTurnover: 4.2,
        forecastAccuracy: 94
      });

      // Mock system health
      setSystemHealth({
        sap: 'connected',
        commerce: 'connected',
        legacy: 'warning',
        ai: 'optimal',
        lastChecked: new Date(),
        responseTime: 245,
        errorCount: 2
      });

      // Mock AI insights
      setAiInsights([
        {
          id: 'insight001',
          type: 'forecast',
          title: 'Construction Season Demand Forecast',
          description: 'Expected 25% increase in aluminium demand over next 90 days due to construction season',
          confidence: 96,
          impact: 'high',
          timestamp: new Date().toISOString(),
          category: 'demand',
          priority: 1,
          isRead: false,
          actionRequired: true,
          suggestedActions: ['Increase aluminium production', 'Secure supplier contracts']
        },
        {
          id: 'insight002',
          type: 'alert',
          title: 'Hardware Supply Chain Alert',
          description: 'Hardware-Screws-001 stock will deplete in 8 days at current consumption rate',
          confidence: 89,
          impact: 'medium',
          timestamp: new Date().toISOString(),
          category: 'inventory',
          priority: 2,
          isRead: false,
          actionRequired: true,
          suggestedActions: ['Create purchase order', 'Check supplier availability']
        },
        {
          id: 'insight003',
          type: 'optimization',
          title: 'Seasonal Inventory Optimization',
          description: 'Steel-Beams-001 inventory levels 40% above optimal for current demand',
          confidence: 92,
          impact: 'medium',
          timestamp: new Date().toISOString(),
          category: 'inventory',
          priority: 3,
          isRead: false,
          actionRequired: true,
          suggestedActions: ['Implement promotional pricing', 'Reduce safety stock levels']
        }
      ]);

      // Mock notifications
      setNotifications([
        {
          id: 'notif001',
          type: 'warning',
          title: 'Low Stock Alert',
          message: 'Aluminium-Sheets-001 is below minimum stock level',
          timestamp: new Date(),
          isRead: false,
          userId: user?.id || '',
          priority: 'high'
        }
      ]);

      // Load initial forecasts
      await loadForecasts();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadForecasts = async () => {
    try {
      const buildingMaterialsProducts = [
        'Aluminium-Sheets-001',
        'Hardware-Screws-001', 
        'Steel-Beams-001'
      ];
      
      const forecastPromises = buildingMaterialsProducts.map(productId =>
        forecastingService.getForecast(productId, 'plant001', selectedForecastConfig)
      );
      
      const forecastResults = await Promise.all(forecastPromises);
      setForecasts(forecastResults);
      
      // Extract recommendations from all forecasts
      const allRecommendations = forecastResults.flatMap(forecast => forecast.recommendations || []);
      setForecastRecommendations(allRecommendations);
      
    } catch (error) {
      console.error('Error loading forecasts:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    setupRealtimeUpdates();
  }, [loadDashboardData]);

  useEffect(() => {
    if (activeTab === 'forecasting') {
      loadForecasts();
    }
  }, [activeTab, selectedForecastConfig]);

  const setupRealtimeUpdates = () => {
    // Subscribe to real-time updates
    const unsubscribeStock = realtimeService.subscribe('stock_update', (data) => {
      console.log('Stock update received:', data);
      // Update inventory data
    });

    const unsubscribeEfficiency = realtimeService.subscribe('efficiency_update', (data) => {
      console.log('Efficiency update received:', data);
      // Update plant efficiency
    });

    const unsubscribeInsights = realtimeService.subscribe('ai_insight', (data) => {
      console.log('AI insight received:', data);
      setAiInsights(prev => [data, ...prev]);
    });

    const unsubscribeSystem = realtimeService.subscribe('system_update', (data) => {
      console.log('System update received:', data);
      setSystemHealth(prev => prev ? { ...prev, ...data.data } : null);
    });

    return () => {
      unsubscribeStock();
      unsubscribeEfficiency();
      unsubscribeInsights();
      unsubscribeSystem();
    };
  };

  const generateNewForecast = async () => {
    if (!selectedProduct || !selectedPlant) return;
    
    setIsGeneratingForecast(true);
    try {
      const newForecast = await forecastingService.generateForecast(
        selectedProduct, 
        selectedPlant, 
        selectedForecastConfig
      );
      setForecasts(prev => [newForecast, ...prev]);
      
      // Update recommendations
      if (newForecast.recommendations) {
        setForecastRecommendations(prev => [...newForecast.recommendations!, ...prev]);
      }
    } catch (error) {
      console.error('Error generating forecast:', error);
    } finally {
      setIsGeneratingForecast(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'connected':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'critical':
      case 'disconnected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'connected':
        return <CheckCircle size={16} color="#10b981" />;
      case 'warning':
        return <AlertTriangle size={16} color="#f59e0b" />;
      case 'critical':
      case 'disconnected':
        return <AlertTriangle size={16} color="#ef4444" />;
      default:
        return <Activity size={16} color="#6b7280" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp size={16} color="#10b981" />;
      case 'decreasing':
        return <TrendingDown size={16} color="#ef4444" />;
      default:
        return <Activity size={16} color="#6b7280" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // SAP Integration Handlers
  const handleCreateSAPRequisition = async (materialId: string, quantity: number) => {
    try {
      const result = await sapIntegrationService.createPurchaseRequisition(
        materialId,
        quantity,
        selectedPlant || 'plant001',
        'AI-generated reorder recommendation'
      );
      alert(`SAP Purchase Requisition created: ${result.sapDocumentNumber}`);
    } catch (error) {
      alert('Failed to create SAP requisition: ' + error);
    }
  };

  const handleUpdateSAPBOM = async (materialId: string, substituteId: string) => {
    try {
      const result = await sapIntegrationService.updateBOM(
        'BOM001',
        materialId,
        substituteId
      );
      alert(`SAP BOM updated: ${result.sapBOMNumber}`);
    } catch (error) {
      alert('Failed to update SAP BOM: ' + error);
    }
  };

  const handleInvestigateInSAP = async (materialId: string) => {
    try {
      const result = await sapIntegrationService.createAnomalyAlert(
        materialId,
        'theft',
        'Unusual outbound movement detected',
        'high'
      );
      alert(`SAP Anomaly Alert created: ${result.sapAlertNumber}`);
    } catch (error) {
      alert('Failed to create SAP anomaly alert: ' + error);
    }
  };

  const handlePostWriteOffInSAP = async (materialId: string, quantity: number) => {
    try {
      const result = await sapIntegrationService.createInventoryAdjustment(
        materialId,
        quantity,
        'AI-recommended obsolescence write-off',
        'write-off'
      );
      alert(`SAP Write-off posted: ${result.sapDocumentNumber}`);
    } catch (error) {
      alert('Failed to post SAP write-off: ' + error);
    }
  };

  const handleCreateSAPMaintenanceOrder = async (equipmentId: string) => {
    try {
      const result = await sapIntegrationService.createMaintenanceOrder(
        equipmentId,
        'AI-predicted maintenance requirement',
        'medium',
        8
      );
      alert(`SAP Maintenance Order created: ${result.sapOrderNumber}`);
    } catch (error) {
      alert('Failed to create SAP maintenance order: ' + error);
    }
  };

  const handleViewInSAPSRM = async (supplierId: string) => {
    try {
      const result = await sapIntegrationService.updateSupplierScore(
        supplierId,
        75,
        'medium',
        ['delivery_performance', 'quality_issues']
      );
      alert(`SAP Supplier Score updated: ${result.sapVendorNumber}`);
    } catch (error) {
      alert('Failed to update SAP supplier score: ' + error);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Debug info - remove this later
  console.log('User role:', user?.role, 'User:', user);

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">AI Inventory Platform</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.name}</p>
        </div>
        <div className="header-right">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search plants, products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Debug info - remove this later */}
          <div style={{ 
            background: '#f0f0f0', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontSize: '12px',
            color: '#666'
          }}>
            Role: {user?.role || 'none'}
          </div>
          <button className="notification-btn">
            <Bell size={20} />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="notification-badge">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>
          <button className="refresh-btn" onClick={loadDashboardData}>
            <RefreshCw size={20} />
          </button>
          <div className="user-menu">
            <img 
              src={user?.avatar || 'https://via.placeholder.com/32'} 
              alt={user?.name}
              className="user-avatar"
            />
            <span className="user-name">{user?.name}</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={20} />
          Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={20} />
          Inventory
        </button>
        <button 
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={20} />
          Analytics
        </button>
        <button 
          className={`nav-tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Zap size={20} />
          AI Insights
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={20} />
          Users
        </button>
        <button 
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={20} />
          Settings
        </button>
        <button 
          className={`nav-tab ${activeTab === 'forecasting' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecasting')}
        >
          <Calendar size={20} />
          Forecasting
        </button>
        <button 
          className={`nav-tab ${activeTab === 'ai-insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-insights')}
        >
          <Zap size={20} />
          AI Insights
        </button>
        {user?.role === 'admin' && (
          <button 
            className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <Shield size={20} />
            Admin
          </button>
        )}
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Analytics Cards */}
            <div className="analytics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <Package size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-number">{analytics?.totalStock.toLocaleString()}</div>
                  <div className="metric-label">Total Stock</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-number">{analytics?.averageEfficiency}%</div>
                  <div className="metric-label">Avg Efficiency</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <Zap size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-number">{analytics?.activeInsights}</div>
                  <div className="metric-label">Active Insights</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <AlertTriangle size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-number">{analytics?.lowStockItems}</div>
                  <div className="metric-label">Low Stock Items</div>
                </div>
              </div>
            </div>

            {/* Plants Overview */}
            <div className="plants-section">
              <div className="section-header">
                <h2>Plant Overview</h2>
                <button className="add-btn">
                  <Plus size={16} />
                  Add Plant
                </button>
              </div>
              <div className="plants-grid">
                {filteredPlants.map((plant) => (
                  <div
                    key={plant.id}
                    className={`plant-card ${selectedPlant === plant.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPlant(selectedPlant === plant.id ? null : plant.id)}
                  >
                    <div className="plant-header">
                      <div>
                        <h3 className="plant-name">{plant.name}</h3>
                        <p className="plant-location">{plant.location}</p>
                      </div>
                      <div className="plant-efficiency">
                        <div className="efficiency-number">{plant.efficiency}%</div>
                        <div className="efficiency-label">Efficiency</div>
                      </div>
                    </div>
                    <div className="plant-stock">
                      <div className="stock-info">
                        <span>Stock Level</span>
                        <span className="stock-number">{plant.stockLevel.toLocaleString()} units</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${(plant.stockLevel / plant.maxCapacity) * 100}%`,
                            backgroundColor: getStatusColor(plant.status)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights and System Health */}
            <div className="insights-grid">
              <div className="insights-card">
                <h2 className="card-title">AI-Powered Insights</h2>
                <div className="insights-list">
                  {aiInsights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="insight-item">
                      <div className="insight-indicator" style={{ backgroundColor: getStatusColor(insight.impact) }}></div>
                      <div className="insight-content">
                        <p className="insight-title">{insight.title}</p>
                        <p className="insight-description">{insight.description}</p>
                        <p className="insight-confidence">{insight.confidence}% confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="insights-card">
                <h2 className="card-title">System Health</h2>
                <div className="system-list">
                  <div className="system-item">
                    <span>SAP S/4HANA Integration</span>
                    <div className="system-status">
                      {getStatusIcon(systemHealth?.sap || 'disconnected')}
                      <span className="status-text" style={{ color: getStatusColor(systemHealth?.sap || 'disconnected') }}>
                        {systemHealth?.sap || 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  <div className="system-item">
                    <span>Commerce Cloud Sync</span>
                    <div className="system-status">
                      {getStatusIcon(systemHealth?.commerce || 'disconnected')}
                      <span className="status-text" style={{ color: getStatusColor(systemHealth?.commerce || 'disconnected') }}>
                        {systemHealth?.commerce || 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  <div className="system-item">
                    <span>Legacy Systems</span>
                    <div className="system-status">
                      {getStatusIcon(systemHealth?.legacy || 'disconnected')}
                      <span className="status-text" style={{ color: getStatusColor(systemHealth?.legacy || 'disconnected') }}>
                        {systemHealth?.legacy || 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  <div className="system-item">
                    <span>AI Engine Status</span>
                    <div className="system-status">
                      {getStatusIcon(systemHealth?.ai || 'offline')}
                      <span className="status-text" style={{ color: getStatusColor(systemHealth?.ai || 'offline') }}>
                        {systemHealth?.ai || 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory-tab">
            <div className="section-header">
              <h2>Inventory Management</h2>
              <div className="header-actions">
                <select
                  className="plant-select"
                  value={selectedPlantInventory}
                  onChange={e => setSelectedPlantInventory(e.target.value)}
                >
                  <option value="">All Plants</option>
                  {plants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name} ({plant.location})
                    </option>
                  ))}
                </select>
                <select
                  className="product-select"
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                >
                  <option value="">All Materials</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
                <button className="filter-btn">
                  <Filter size={16} />
                  Filter
                </button>
                <button className="export-btn">
                  <Download size={16} />
                  Export
                </button>
                <button className="add-btn">
                  <Plus size={16} />
                  Add Product
                </button>
              </div>
            </div>
            
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Stock Level</th>
                    <th>Cost</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedProduct || selectedPlantInventory
                    ? products.filter(product => {
                        const matchesProduct = selectedProduct ? product.id === selectedProduct : true;
                        // For demo, assume all products are at all plants; in real app, filter by inventory/plant
                        const matchesPlant = selectedPlantInventory ? true : true;
                        return matchesProduct && matchesPlant;
                      })
                    : products
                  ).map((product) => (
                    <tr key={product.id}>
                      <td>{product.sku}</td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.minStockLevel}</td>
                      <td>${product.cost}</td>
                      <td>${product.price}</td>
                      <td>
                        <span className="status-badge optimal">In Stock</span>
                      </td>
                      <td>
                        <button className="action-btn">Edit</button>
                        <button className="action-btn">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="analytics-header">
              <h2>Location-Based Stock Analytics</h2>
              <p>Comprehensive visibility into stock levels, trends, and performance across all locations</p>
            </div>

            {/* Analytics Filters */}
            <div className="analytics-filters">
              <div className="filter-group">
                <label>Time Range:</label>
                <select defaultValue="30">
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Category:</label>
                <select defaultValue="">
                  <option value="">All Categories</option>
                  <option value="aluminium">Aluminium</option>
                  <option value="hardware">Hardware</option>
                  <option value="steel">Steel</option>
                  <option value="concrete">Concrete</option>
                  <option value="lumber">Lumber</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Stock Status:</label>
                <select defaultValue="">
                  <option value="">All Status</option>
                  <option value="low">Low Stock</option>
                  <option value="optimal">Optimal</option>
                  <option value="overstock">Overstock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
              <button className="refresh-analytics-btn">
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {/* Key Metrics Overview */}
            <div className="analytics-metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <Package size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-number">12,157</div>
                  <div className="metric-label">Total Stock Units</div>
                  <div className="metric-trend positive">
                    <TrendingUp size={14} />
                    +5.2% vs last month
                  </div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-number">$284,750</div>
                  <div className="metric-label">Total Stock Value</div>
                  <div className="metric-trend positive">
                    <TrendingUp size={14} />
                    +8.7% vs last month
                  </div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <AlertTriangle size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-number">12</div>
                  <div className="metric-label">Low Stock Items</div>
                  <div className="metric-trend negative">
                    <TrendingDown size={14} />
                    +3 vs last week
                  </div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <BarChart3 size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-number">4.2</div>
                  <div className="metric-label">Stock Turnover Rate</div>
                  <div className="metric-trend positive">
                    <TrendingUp size={14} />
                    +0.3 vs last month
                  </div>
                </div>
              </div>
            </div>

            {/* Location-Based Stock Overview */}
            <div className="location-analytics-section">
              <h3>Stock Levels by Location</h3>
              <div className="location-stock-grid">
                {plants.map((plant) => {
                  const stockUtilization = (plant.stockLevel / plant.maxCapacity) * 100;
                  const stockValue = plant.stockLevel * 25; // Mock calculation
                  
                  return (
                    <div key={plant.id} className="location-stock-card">
                      <div className="location-header">
                        <h4>{plant.name}</h4>
                        <span className="location-type">{plant.type}</span>
                      </div>
                      
                      <div className="stock-overview">
                        <div className="stock-utilization">
                          <div className="utilization-bar">
                            <div 
                              className="utilization-fill"
                              style={{ 
                                width: `${stockUtilization}%`,
                                backgroundColor: stockUtilization > 80 ? '#ef4444' : 
                                                 stockUtilization > 60 ? '#f59e0b' : '#10b981'
                              }}
                            ></div>
                          </div>
                          <div className="utilization-text">
                            <span>{plant.stockLevel.toLocaleString()} / {plant.maxCapacity.toLocaleString()}</span>
                            <span className="utilization-percent">{stockUtilization.toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <div className="stock-details">
                          <div className="detail-item">
                            <span className="detail-label">Stock Value:</span>
                            <span className="detail-value">${stockValue.toLocaleString()}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Efficiency:</span>
                            <span className="detail-value">{plant.efficiency}%</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className={`status-badge ${plant.status}`}>
                              {getStatusIcon(plant.status)}
                              {plant.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="location-insights">
                        <div className="insight-item">
                          <span className="insight-label">Top Products:</span>
                          <div className="top-products">
                            <span>Aluminium Sheets</span>
                            <span>Hardware Screws</span>
                            <span>Steel Beams</span>
                          </div>
                        </div>
                        <div className="insight-item">
                          <span className="insight-label">Recent Activity:</span>
                          <div className="recent-activity">
                            <span>+500 units received</span>
                            <span>-200 units shipped</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product Category Analysis */}
            <div className="category-analytics-section">
              <h3>Stock Analysis by Product Category</h3>
              <div className="category-analysis-grid">
                <div className="category-card">
                  <div className="category-header">
                    <h4>Aluminium Products</h4>
                    <span className="category-stock">3,450 units</span>
                  </div>
                  <div className="category-breakdown">
                    <div className="breakdown-item">
                      <span>Sheets</span>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: '60%', backgroundColor: '#10b981' }}></div>
                      </div>
                      <span>1,200 units</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Profiles</span>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: '40%', backgroundColor: '#f59e0b' }}></div>
                      </div>
                      <span>800 units</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Coils</span>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: '80%', backgroundColor: '#ef4444' }}></div>
                      </div>
                      <span>1,450 units</span>
                    </div>
                  </div>
                  <div className="category-status">
                    <span className="status-indicator optimal">Optimal Stock Levels</span>
                  </div>
                </div>

                <div className="category-card">
                  <div className="category-header">
                    <h4>Hardware Items</h4>
                    <span className="category-stock">5,200 units</span>
                  </div>
                  <div className="category-breakdown">
                    <div className="breakdown-item">
                      <span>Screws</span>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: '20%', backgroundColor: '#ef4444' }}></div>
                      </div>
                      <span>1,000 units</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Bolts</span>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: '70%', backgroundColor: '#10b981' }}></div>
                      </div>
                      <span>2,100 units</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Hinges</span>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: '50%', backgroundColor: '#f59e0b' }}></div>
                      </div>
                      <span>2,100 units</span>
                    </div>
                  </div>
                  <div className="category-status">
                    <span className="status-indicator warning">Low Stock Alert</span>
                  </div>
                </div>

                <div className="category-card">
                  <div className="category-header">
                    <h4>Steel Products</h4>
                    <span className="category-stock">2,800 units</span>
                  </div>
                  <div className="category-breakdown">
                    <div className="breakdown-item">
                      <span>Beams</span>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: '90%', backgroundColor: '#ef4444' }}></div>
                      </div>
                      <span>1,800 units</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Plates</span>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: '30%', backgroundColor: '#f59e0b' }}></div>
                      </div>
                      <span>1,000 units</span>
                    </div>
                  </div>
                  <div className="category-status">
                    <span className="status-indicator critical">Overstock Warning</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Movement Trends */}
            <div className="movement-trends-section">
              <h3>Stock Movement Trends</h3>
              <div className="trends-grid">
                <div className="trend-card">
                  <h4>Inbound vs Outbound</h4>
                  <div className="trend-chart">
                    <div className="chart-bars">
                      <div className="chart-bar-group">
                        <div className="bar-label">Mon</div>
                        <div className="bar-container">
                          <div className="bar inbound" style={{ height: '60%' }}></div>
                          <div className="bar outbound" style={{ height: '40%' }}></div>
                        </div>
                      </div>
                      <div className="chart-bar-group">
                        <div className="bar-label">Tue</div>
                        <div className="bar-container">
                          <div className="bar inbound" style={{ height: '80%' }}></div>
                          <div className="bar outbound" style={{ height: '50%' }}></div>
                        </div>
                      </div>
                      <div className="chart-bar-group">
                        <div className="bar-label">Wed</div>
                        <div className="bar-container">
                          <div className="bar inbound" style={{ height: '45%' }}></div>
                          <div className="bar outbound" style={{ height: '70%' }}></div>
                        </div>
                      </div>
                      <div className="chart-bar-group">
                        <div className="bar-label">Thu</div>
                        <div className="bar-container">
                          <div className="bar inbound" style={{ height: '75%' }}></div>
                          <div className="bar outbound" style={{ height: '55%' }}></div>
                        </div>
                      </div>
                      <div className="chart-bar-group">
                        <div className="bar-label">Fri</div>
                        <div className="bar-container">
                          <div className="bar inbound" style={{ height: '65%' }}></div>
                          <div className="bar outbound" style={{ height: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-color inbound"></div>
                        <span>Inbound</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color outbound"></div>
                        <span>Outbound</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="trend-card">
                  <h4>Stock Level Trends</h4>
                  <div className="trend-line-chart">
                    <div className="line-chart">
                      <div className="chart-line" style={{ 
                        background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)',
                        height: '2px',
                        width: '100%',
                        position: 'relative'
                      }}>
                        <div className="data-point" style={{ left: '10%', top: '-4px' }}></div>
                        <div className="data-point" style={{ left: '30%', top: '-8px' }}></div>
                        <div className="data-point" style={{ left: '50%', top: '-2px' }}></div>
                        <div className="data-point" style={{ left: '70%', top: '-6px' }}></div>
                        <div className="data-point" style={{ left: '90%', top: '-4px' }}></div>
                      </div>
                    </div>
                    <div className="trend-summary">
                      <div className="trend-item">
                        <span>Average Stock:</span>
                        <strong>8,450 units</strong>
                      </div>
                      <div className="trend-item">
                        <span>Peak Stock:</span>
                        <strong>12,200 units</strong>
                      </div>
                      <div className="trend-item">
                        <span>Lowest Stock:</span>
                        <strong>5,800 units</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="performance-metrics-section">
              <h3>Location Performance Metrics</h3>
              <div className="performance-table">
                <table>
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Stock Turnover</th>
                      <th>Fill Rate</th>
                      <th>Order Accuracy</th>
                      <th>Space Utilization</th>
                      <th>Efficiency Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plants.map((plant) => (
                      <tr key={plant.id}>
                        <td>
                          <div className="location-info">
                            <strong>{plant.name}</strong>
                            <span className="location-type">{plant.type}</span>
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell">
                            <span className="metric-value">{(Math.random() * 5 + 2).toFixed(1)}</span>
                            <div className="metric-bar">
                              <div className="metric-fill" style={{ width: `${Math.random() * 100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell">
                            <span className="metric-value">{(Math.random() * 20 + 80).toFixed(1)}%</span>
                            <div className="metric-bar">
                              <div className="metric-fill" style={{ width: `${Math.random() * 100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell">
                            <span className="metric-value">{(Math.random() * 10 + 90).toFixed(1)}%</span>
                            <div className="metric-bar">
                              <div className="metric-fill" style={{ width: `${Math.random() * 100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell">
                            <span className="metric-value">{(plant.stockLevel / plant.maxCapacity * 100).toFixed(1)}%</span>
                            <div className="metric-bar">
                              <div className="metric-fill" style={{ width: `${(plant.stockLevel / plant.maxCapacity) * 100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="efficiency-score">
                            <span className="score-value">{plant.efficiency}%</span>
                            <span className={`score-badge ${plant.efficiency > 80 ? 'high' : plant.efficiency > 60 ? 'medium' : 'low'}`}>
                              {plant.efficiency > 80 ? 'High' : plant.efficiency > 60 ? 'Medium' : 'Low'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alerts and Recommendations */}
            <div className="analytics-alerts-section">
              <h3>Stock Alerts & Recommendations</h3>
              <div className="alerts-grid">
                <div className="alert-card critical">
                  <div className="alert-header">
                    <AlertTriangle size={20} />
                    <span className="alert-title">Critical Stock Alert</span>
                  </div>
                  <p>Hardware Screws at Plant A are critically low (15% of minimum stock level)</p>
                  <div className="alert-actions">
                    <button className="alert-btn">Create Purchase Order</button>
                    <button className="alert-btn secondary">View Details</button>
                  </div>
                </div>

                <div className="alert-card warning">
                  <div className="alert-header">
                    <AlertTriangle size={20} />
                    <span className="alert-title">Overstock Warning</span>
                  </div>
                  <p>Steel Beams at Plant B exceed optimal levels by 40%</p>
                  <div className="alert-actions">
                    <button className="alert-btn">Review Inventory</button>
                    <button className="alert-btn secondary">View Details</button>
                  </div>
                </div>

                <div className="alert-card info">
                  <div className="alert-header">
                    <CheckCircle size={20} />
                    <span className="alert-title">Performance Improvement</span>
                  </div>
                  <p>Plant C efficiency increased by 15% this month</p>
                  <div className="alert-actions">
                    <button className="alert-btn">View Report</button>
                    <button className="alert-btn secondary">Share</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="ai-tab">
            <h2>AI Insights & Predictions</h2>
            <p>AI features coming soon...</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <h2>User Management</h2>
            <p>User management features coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h2>System Settings</h2>
            <p>Settings panel coming soon...</p>
          </div>
        )}

        {activeTab === 'forecasting' && (
          <div className="forecasting-tab">
            <div className="forecasting-header">
              <h2>Building Materials Forecasting</h2>
              <p>AI-powered demand forecasting for aluminium, hardware, and construction materials</p>
            </div>

            {/* Forecast Configuration */}
            <div className="forecast-config-section">
              <h3>Forecast Configuration</h3>
              <div className="config-controls">
                <div className="config-group">
                  <label>Algorithm:</label>
                  <select 
                    value={selectedForecastConfig} 
                    onChange={(e) => setSelectedForecastConfig(e.target.value)}
                  >
                    <option value="construction_ensemble">Construction Materials Ensemble</option>
                    <option value="aluminium_config">Aluminium Industry LSTM</option>
                    <option value="hardware_config">Hardware Supply Chain ARIMA</option>
                  </select>
                </div>
                <div className="config-group">
                  <label>Product:</label>
                  <select 
                    value={selectedProduct} 
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Select Product</option>
                    <option value="Aluminium-Sheets-001">Aluminium Sheets</option>
                    <option value="Aluminium-Profiles-002">Aluminium Profiles</option>
                    <option value="Aluminium-Coils-003">Aluminium Coils</option>
                    <option value="Hardware-Screws-001">Hardware Screws</option>
                    <option value="Hardware-Bolts-002">Hardware Bolts</option>
                    <option value="Hardware-Hinges-003">Hardware Hinges</option>
                    <option value="Steel-Beams-001">Steel Beams</option>
                    <option value="Concrete-Mix-002">Concrete Mix</option>
                    <option value="Lumber-2x4-003">Lumber 2x4</option>
                  </select>
                </div>
                <div className="config-group">
                  <label>Plant:</label>
                  <select 
                    value={selectedPlant || ''} 
                    onChange={(e) => setSelectedPlant(e.target.value)}
                  >
                    <option value="">Select Plant</option>
                    {plants.map(plant => (
                      <option key={plant.id} value={plant.id}>{plant.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  className="generate-forecast-btn"
                  onClick={generateNewForecast}
                  disabled={!selectedProduct || !selectedPlant || isGeneratingForecast}
                >
                  {isGeneratingForecast ? (
                    <>
                      <RefreshCw size={16} className="spinning" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Target size={16} />
                      Generate Forecast
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Current Forecasts */}
            <div className="forecasts-section">
              <h3>Current Forecasts</h3>
              <div className="forecasts-grid">
                {forecasts.map((forecast) => (
                  <div key={forecast.id} className="forecast-card">
                    <div className="forecast-header">
                      <h4>{forecast.productId}</h4>
                      <div className="forecast-meta">
                        <span className="algorithm">{forecast.algorithm}</span>
                        <span className="accuracy">{forecast.accuracy}% accuracy</span>
                      </div>
                    </div>
                    
                    <div className="forecast-details">
                      <div className="forecast-period">
                        <Calendar size={14} />
                        <span>{Math.ceil((forecast.endDate.getTime() - forecast.startDate.getTime()) / (1000 * 60 * 60 * 24))} days forecast</span>
                      </div>
                      
                      {forecast.trend && (
                        <div className="trend-info">
                          {getTrendIcon(forecast.trend.direction)}
                          <span>{forecast.trend.direction} trend</span>
                          <span className="strength">({Math.round(forecast.trend.strength * 100)}% strength)</span>
                        </div>
                      )}
                      
                      {forecast.seasonality && (
                        <div className="seasonality-info">
                          <span>Seasonal pattern detected</span>
                          <span className="strength">({Math.round(forecast.seasonality.strength * 100)}% strength)</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="forecast-predictions">
                      <div className="prediction-summary">
                        <div className="avg-demand">
                          <span>Avg Daily Demand:</span>
                          <strong>{Math.round(forecast.predictedDemand.reduce((a, b) => a + b, 0) / forecast.predictedDemand.length)}</strong>
                        </div>
                        <div className="peak-demand">
                          <span>Peak Demand:</span>
                          <strong>{Math.max(...forecast.predictedDemand)}</strong>
                        </div>
                      </div>
                    </div>
                    
                    {forecast.recommendations && forecast.recommendations.length > 0 && (
                      <div className="forecast-recommendations">
                        <h5>Recommendations</h5>
                        {forecast.recommendations.slice(0, 2).map((rec) => (
                          <div key={rec.id} className="recommendation-item">
                            <div className="rec-header">
                              <span className="rec-type">{rec.type}</span>
                              <span 
                                className="rec-impact" 
                                style={{ backgroundColor: getImpactColor(rec.impact) }}
                              >
                                {rec.impact}
                              </span>
                            </div>
                            <p className="rec-title">{rec.title}</p>
                            <p className="rec-description">{rec.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast Recommendations */}
            {forecastRecommendations.length > 0 && (
              <div className="recommendations-section">
                <h3>AI Recommendations</h3>
                <div className="recommendations-grid">
                  {forecastRecommendations.slice(0, 6).map((recommendation) => (
                    <div key={recommendation.id} className="recommendation-card">
                      <div className="rec-header">
                        <div className="rec-type-badge">{recommendation.type}</div>
                        <div 
                          className="rec-impact-badge"
                          style={{ backgroundColor: getImpactColor(recommendation.impact) }}
                        >
                          {recommendation.impact}
                        </div>
                      </div>
                      
                      <h4>{recommendation.title}</h4>
                      <p>{recommendation.description}</p>
                      
                      <div className="rec-details">
                        <div className="rec-confidence">
                          <Target size={14} />
                          <span>{recommendation.confidence}% confidence</span>
                        </div>
                        
                        {recommendation.costBenefit && (
                          <div className="rec-roi">
                            <TrendingUp size={14} />
                            <span>{recommendation.costBenefit.roi}% ROI</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="rec-actions">
                        <div className="suggested-action">
                          <strong>Suggested Action:</strong>
                          <p>{recommendation.suggestedAction}</p>
                        </div>
                        <div className="expected-outcome">
                          <strong>Expected Outcome:</strong>
                          <p>{recommendation.expectedOutcome}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Industry Insights */}
            <div className="industry-insights-section">
              <h3>Building Materials Industry Insights</h3>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-icon">
                    <Calendar size={24} />
                  </div>
                  <h4>Construction Season</h4>
                  <p>Peak demand period: March - October</p>
                  <div className="seasonal-factors">
                    <div className="factor">
                      <span>Spring:</span>
                      <span className="factor-value">+30% demand</span>
                    </div>
                    <div className="factor">
                      <span>Summer:</span>
                      <span className="factor-value">+20% demand</span>
                    </div>
                    <div className="factor">
                      <span>Fall:</span>
                      <span className="factor-value">-10% demand</span>
                    </div>
                    <div className="factor">
                      <span>Winter:</span>
                      <span className="factor-value">-30% demand</span>
                    </div>
                  </div>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon">
                    <TrendingUp size={24} />
                  </div>
                  <h4>Market Trends</h4>
                  <p>Current market indicators</p>
                  <div className="market-indicators">
                    <div className="indicator">
                      <span>Construction Index:</span>
                      <span className="indicator-value positive">+5.2%</span>
                    </div>
                    <div className="indicator">
                      <span>Housing Starts:</span>
                      <span className="indicator-value positive">+8.7%</span>
                    </div>
                    <div className="indicator">
                      <span>Building Permits:</span>
                      <span className="indicator-value positive">+12.3%</span>
                    </div>
                    <div className="indicator">
                      <span>Aluminium Prices:</span>
                      <span className="indicator-value negative">+15.4%</span>
                    </div>
                  </div>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon">
                    <AlertTriangle size={24} />
                  </div>
                  <h4>Supply Chain Alerts</h4>
                  <p>Current supply chain status</p>
                  <div className="supply-alerts">
                    <div className="alert-item warning">
                      <span>Aluminium supply constraints</span>
                      <span className="alert-severity">Medium</span>
                    </div>
                    <div className="alert-item info">
                      <span>Hardware supplier capacity</span>
                      <span className="alert-severity">Good</span>
                    </div>
                    <div className="alert-item critical">
                      <span>Steel import delays</span>
                      <span className="alert-severity">High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai-insights' && (
          <div className="ai-insights-tab">
            <h2>AI Insights for SAP Inventory & Material Management</h2>
            <div className="ai-insights-grid">
              {/* Reorder Recommendations */}
              <div className="ai-card">
                <h3>Reorder Recommendations</h3>
                <ul>
                  <li>
                    <strong>Aluminium-Sheets-001</strong>: Suggest reorder 2,000 units (Stockout in 7 days)
                    <button className="ai-action-btn" onClick={() => handleCreateSAPRequisition('Aluminium-Sheets-001', 2000)}>Create SAP Requisition</button>
                  </li>
                  <li>
                    <strong>Hardware-Screws-001</strong>: Suggest reorder 5,000 units (Stockout in 10 days)
                    <button className="ai-action-btn" onClick={() => handleCreateSAPRequisition('Hardware-Screws-001', 5000)}>Create SAP Requisition</button>
                  </li>
                </ul>
              </div>
              {/* Anomaly Alerts */}
              <div className="ai-card">
                <h3>Anomaly Alerts</h3>
                <ul>
                  <li>
                    <strong>Steel-Beams-001</strong>: Unusual outbound movement detected (Possible theft)
                    <button className="ai-action-btn" onClick={() => handleInvestigateInSAP('Steel-Beams-001')}>Investigate in SAP</button>
                  </li>
                  <li>
                    <strong>Concrete-Mix-002</strong>: Negative stock posting anomaly
                    <button className="ai-action-btn">Review in SAP</button>
                  </li>
                </ul>
              </div>
              {/* Material Substitution */}
              <div className="ai-card">
                <h3>Material Substitution Suggestions</h3>
                <ul>
                  <li>
                    <strong>Aluminium-Profiles-002</strong>: Substitute with Aluminium-Coils-003 (Out of stock)
                    <button className="ai-action-btn" onClick={() => handleUpdateSAPBOM('Aluminium-Profiles-002', 'Aluminium-Coils-003')}>Update SAP BOM</button>
                  </li>
                </ul>
              </div>
              {/* Supplier Risk Scores */}
              <div className="ai-card">
                <h3>Supplier Risk Scores</h3>
                <ul>
                  <li>
                    <strong>Supplier: MetalWorks Inc.</strong> - Score: <span className="risk-high">High Risk</span>
                    <button className="ai-action-btn" onClick={() => handleViewInSAPSRM('MetalWorks Inc.')}>View in SAP SRM</button>
                  </li>
                  <li>
                    <strong>Supplier: Fasteners Ltd.</strong> - Score: <span className="risk-low">Low Risk</span>
                    <button className="ai-action-btn" onClick={() => handleViewInSAPSRM('Fasteners Ltd.')}>View in SAP SRM</button>
                  </li>
                </ul>
              </div>
              {/* Obsolescence Warnings */}
              <div className="ai-card">
                <h3>Obsolescence Warnings</h3>
                <ul>
                  <li>
                    <strong>Hardware-Hinges-003</strong>: 1,200 units slow-moving, recommend write-off
                    <button className="ai-action-btn" onClick={() => handlePostWriteOffInSAP('Hardware-Hinges-003', 1200)}>Post Write-Off in SAP</button>
                  </li>
                </ul>
              </div>
              {/* Predictive Maintenance */}
              <div className="ai-card">
                <h3>Predictive Maintenance</h3>
                <ul>
                  <li>
                    <strong>Spare: Conveyor Belt</strong>: Predicted replacement in 14 days
                    <button className="ai-action-btn" onClick={() => handleCreateSAPMaintenanceOrder('Spare: Conveyor Belt')}>Create SAP Maintenance Order</button>
                  </li>
                </ul>
              </div>
              {/* Inventory Classification */}
              <div className="ai-card">
                <h3>Inventory Classification (ABC/XYZ)</h3>
                <ul>
                  <li>
                    <strong>Aluminium-Coils-003</strong>: Class A/X (High value, stable demand)
                  </li>
                  <li>
                    <strong>Hardware-Bolts-002</strong>: Class C/Z (Low value, erratic demand)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="admin-tab">
            <AdminPanel />
          </div>
        )}
      </main>
    </div>
  );
} 