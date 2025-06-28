import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Search,
  Eye,
  Activity
} from 'lucide-react';
import './MultiErpDashboard.css';

interface UnifiedInventoryItem {
  id: string;
  materialId: string;
  materialName: string;
  plantId: string;
  plantName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  status: string;
  sourceSystem: {
    erp: string;
    systemId: string;
    originalId: string;
    syncTimestamp: Date;
  };
  lastUpdated: Date;
}

interface CrossSystemAnalytics {
  totalInventoryValue: number;
  totalItems: number;
  lowStockItems: number;
  overstockItems: number;
  systemDistribution: Record<string, {
    itemCount: number;
    totalValue: number;
    lastSync: Date;
  }>;
}

interface ErpSystemConfig {
  id: string;
  name: string;
  type: string;
  version: string;
  syncSettings: {
    enabled: boolean;
    interval: number;
    lastSync: Date;
    status: 'active' | 'error' | 'disabled';
  };
}

const MultiErpDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [inventory, setInventory] = useState<UnifiedInventoryItem[]>([]);
  const [analytics, setAnalytics] = useState<CrossSystemAnalytics | null>(null);
  const [erpSystems, setErpSystems] = useState<ErpSystemConfig[]>([]);
  const [filters, setFilters] = useState({
    materialId: '',
    plantId: '',
    erpSystem: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data generation
  useEffect(() => {
    generateMockData();
    setLoading(false);
  }, []);

  const generateMockData = () => {
    // Generate mock ERP systems
    const mockErpSystems: ErpSystemConfig[] = [
      {
        id: 'sap_s4hana_main',
        name: 'SAP S/4HANA 2021',
        type: 'sap_s4hana',
        version: '2021',
        syncSettings: {
          enabled: true,
          interval: 5,
          lastSync: new Date(),
          status: 'active'
        }
      },
      {
        id: 'dynamics365_main',
        name: 'Microsoft Dynamics 365',
        type: 'dynamics',
        version: '2023',
        syncSettings: {
          enabled: true,
          interval: 10,
          lastSync: new Date(Date.now() - 300000),
          status: 'active'
        }
      },
      {
        id: 'oracle_erp_main',
        name: 'Oracle ERP Cloud',
        type: 'oracle',
        version: '2023',
        syncSettings: {
          enabled: true,
          interval: 15,
          lastSync: new Date(Date.now() - 600000),
          status: 'active'
        }
      }
    ];

    // Generate mock inventory data
    const mockInventory: UnifiedInventoryItem[] = [];
    const materials = [
      { id: 'AL001', name: 'Aluminium Sheets 2mm' },
      { id: 'AL002', name: 'Aluminium Profiles 6063' },
      { id: 'HW001', name: 'Stainless Steel Screws M6' },
      { id: 'ST001', name: 'Steel Beams I-Beam 200mm' },
      { id: 'CN001', name: 'Concrete Mix C25' },
      { id: 'LG001', name: 'Lumber 2x4 Pine' }
    ];

    const plants = ['PLANT001', 'PLANT002', 'PLANT003'];
    const erpNames = ['SAP S/4HANA 2021', 'Microsoft Dynamics 365', 'Oracle ERP Cloud'];

    materials.forEach(material => {
      plants.forEach(plant => {
        erpNames.forEach(erpName => {
          const quantity = Math.floor(Math.random() * 10000) + 100;
          const unitPrice = Math.random() * 100 + 10;
          
          mockInventory.push({
            id: `${material.id}-${plant}-${erpName}`,
            materialId: material.id,
            materialName: material.name,
            plantId: plant,
            plantName: `Plant ${plant}`,
            quantity,
            unit: 'PCS',
            unitPrice,
            totalValue: quantity * unitPrice,
            status: 'available',
            sourceSystem: {
              erp: erpName,
              systemId: erpName === 'SAP S/4HANA 2021' ? 'sap_s4hana_main' : 
                       erpName === 'Microsoft Dynamics 365' ? 'dynamics365_main' : 'oracle_erp_main',
              originalId: material.id,
              syncTimestamp: new Date()
            },
            lastUpdated: new Date()
          });
        });
      });
    });

    // Generate mock analytics
    const mockAnalytics: CrossSystemAnalytics = {
      totalInventoryValue: mockInventory.reduce((sum, item) => sum + item.totalValue, 0),
      totalItems: mockInventory.length,
      lowStockItems: mockInventory.filter(item => item.quantity < 500).length,
      overstockItems: mockInventory.filter(item => item.quantity > 8000).length,
      systemDistribution: {
        'SAP S/4HANA 2021': {
          itemCount: mockInventory.filter(item => item.sourceSystem.erp === 'SAP S/4HANA 2021').length,
          totalValue: mockInventory.filter(item => item.sourceSystem.erp === 'SAP S/4HANA 2021')
            .reduce((sum, item) => sum + item.totalValue, 0),
          lastSync: new Date()
        },
        'Microsoft Dynamics 365': {
          itemCount: mockInventory.filter(item => item.sourceSystem.erp === 'Microsoft Dynamics 365').length,
          totalValue: mockInventory.filter(item => item.sourceSystem.erp === 'Microsoft Dynamics 365')
            .reduce((sum, item) => sum + item.totalValue, 0),
          lastSync: new Date(Date.now() - 300000)
        },
        'Oracle ERP Cloud': {
          itemCount: mockInventory.filter(item => item.sourceSystem.erp === 'Oracle ERP Cloud').length,
          totalValue: mockInventory.filter(item => item.sourceSystem.erp === 'Oracle ERP Cloud')
            .reduce((sum, item) => sum + item.totalValue, 0),
          lastSync: new Date(Date.now() - 600000)
        }
      }
    };

    setErpSystems(mockErpSystems);
    setInventory(mockInventory);
    setAnalytics(mockAnalytics);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.materialId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilters = (!filters.erpSystem || item.sourceSystem.erp === filters.erpSystem) &&
                          (!filters.status || item.status === filters.status);
    
    return matchesSearch && matchesFilters;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} color="#10b981" />;
      case 'error':
        return <XCircle size={16} color="#ef4444" />;
      case 'disabled':
        return <AlertTriangle size={16} color="#f59e0b" />;
      default:
        return <Activity size={16} color="#6b7280" />;
    }
  };

  const getStockStatus = (item: UnifiedInventoryItem) => {
    if (item.quantity < 500) return 'low';
    if (item.quantity > 8000) return 'overstock';
    return 'normal';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'low':
        return '#ef4444';
      case 'overstock':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const headers = [
        'Material ID', 'Material Name', 'Plant', 'Quantity', 'Unit', 'Unit Price', 
        'Total Value', 'ERP System', 'Last Updated', 'Status'
      ];
      const rows = filteredInventory.map(item => [
        item.materialId,
        item.materialName,
        item.plantName,
        item.quantity,
        item.unit,
        item.unitPrice,
        item.totalValue,
        item.sourceSystem.erp,
        item.lastUpdated.toISOString(),
        item.status
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `multi-erp-inventory-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(filteredInventory, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `multi-erp-inventory-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  if (loading) {
    return <div className="loading">Loading Multi-ERP Dashboard...</div>;
  }

  return (
    <div className="multi-erp-dashboard">
      <div className="dashboard-header">
        <h1>Multi-ERP Inventory Visibility</h1>
        <p>Unified stock visibility across SAP S/4HANA, Dynamics 365, Oracle ERP, and more</p>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          Overview
        </button>
        <button 
          className={activeTab === 'inventory' ? 'active' : ''} 
          onClick={() => setActiveTab('inventory')}
        >
          <Database size={16} />
          Unified Inventory
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''} 
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={16} />
          Cross-System Analytics
        </button>
        <button 
          className={activeTab === 'systems' ? 'active' : ''} 
          onClick={() => setActiveTab('systems')}
        >
          <Activity size={16} />
          ERP Systems
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-tab">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Inventory Value</h3>
              <div className="metric-value">
                ${analytics?.totalInventoryValue.toLocaleString() || '0'}
              </div>
              <div className="metric-label">Across all ERP systems</div>
            </div>
            <div className="metric-card">
              <h3>Total Items</h3>
              <div className="metric-value">
                {analytics?.totalItems || 0}
              </div>
              <div className="metric-label">Unified inventory items</div>
            </div>
            <div className="metric-card">
              <h3>Low Stock Items</h3>
              <div className="metric-value warning">
                {analytics?.lowStockItems || 0}
              </div>
              <div className="metric-label">Below reorder point</div>
            </div>
            <div className="metric-card">
              <h3>Overstock Items</h3>
              <div className="metric-value warning">
                {analytics?.overstockItems || 0}
              </div>
              <div className="metric-label">Above max level</div>
            </div>
          </div>

          {/* ERP System Status */}
          <div className="erp-systems-status">
            <h3>ERP System Status</h3>
            <div className="systems-grid">
              {erpSystems.map(system => (
                <div key={system.id} className="system-card">
                  <div className="system-header">
                    <h4>{system.name}</h4>
                    {getStatusIcon(system.syncSettings.status)}
                  </div>
                  <div className="system-details">
                    <p><strong>Type:</strong> {system.type}</p>
                    <p><strong>Version:</strong> {system.version}</p>
                    <p><strong>Last Sync:</strong> {system.syncSettings.lastSync.toLocaleString()}</p>
                    <p><strong>Sync Interval:</strong> {system.syncSettings.interval} minutes</p>
                  </div>
                  <div className="system-stats">
                    <span>Items: {analytics?.systemDistribution[system.name]?.itemCount || 0}</span>
                    <span>Value: ${analytics?.systemDistribution[system.name]?.totalValue.toLocaleString() || '0'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Unified Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="inventory-tab">
          {/* Filters and Search */}
          <div className="inventory-controls">
            <div className="search-section">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filters-section">
              <select 
                value={filters.erpSystem} 
                onChange={(e) => setFilters({...filters, erpSystem: e.target.value})}
              >
                <option value="">All ERP Systems</option>
                <option value="SAP S/4HANA 2021">SAP S/4HANA 2021</option>
                <option value="Microsoft Dynamics 365">Microsoft Dynamics 365</option>
                <option value="Oracle ERP Cloud">Oracle ERP Cloud</option>
              </select>
              
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="export-section">
              <button onClick={() => handleExport('csv')} className="export-btn">
                <Download size={16} />
                Export CSV
              </button>
              <button onClick={() => handleExport('json')} className="export-btn">
                <Download size={16} />
                Export JSON
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Material ID</th>
                  <th>Material Name</th>
                  <th>Plant</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>ERP System</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item.id}>
                    <td>{item.materialId}</td>
                    <td>{item.materialName}</td>
                    <td>{item.plantName}</td>
                    <td>
                      <span 
                        style={{color: getStockStatusColor(getStockStatus(item))}}
                      >
                        {item.quantity.toLocaleString()}
                      </span>
                    </td>
                    <td>{item.unit}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>${item.totalValue.toLocaleString()}</td>
                    <td>
                      <span className="erp-badge">
                        {item.sourceSystem.erp}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.lastUpdated.toLocaleString()}</td>
                    <td>
                      <button className="action-btn" title="View Details">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cross-System Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-tab">
          <h3>Cross-System Analytics</h3>
          
          {/* System Distribution Chart */}
          <div className="chart-section">
            <h4>Inventory Distribution by ERP System</h4>
            <div className="chart-container">
              {analytics && Object.entries(analytics.systemDistribution).map(([system, data]) => (
                <div key={system} className="chart-bar">
                  <div className="bar-label">{system}</div>
                  <div className="bar-container">
                    <div 
                      className="bar" 
                      style={{width: `${(data.itemCount / analytics.totalItems) * 100}%`}}
                    ></div>
                  </div>
                  <div className="bar-value">
                    {data.itemCount} items (${data.totalValue.toLocaleString()})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ERP Systems Tab */}
      {activeTab === 'systems' && (
        <div className="systems-tab">
          <h3>ERP System Management</h3>
          
          <div className="systems-grid">
            {erpSystems.map(system => (
              <div key={system.id} className="system-management-card">
                <div className="system-header">
                  <h4>{system.name}</h4>
                  <div className="system-status">
                    {getStatusIcon(system.syncSettings.status)}
                    <span className={`status-text ${system.syncSettings.status}`}>
                      {system.syncSettings.status}
                    </span>
                  </div>
                </div>
                
                <div className="system-details">
                  <p><strong>Type:</strong> {system.type}</p>
                  <p><strong>Version:</strong> {system.version}</p>
                  <p><strong>Sync Interval:</strong> {system.syncSettings.interval} minutes</p>
                  <p><strong>Last Sync:</strong> {system.syncSettings.lastSync.toLocaleString()}</p>
                </div>
                
                <div className="system-actions">
                  <button className="action-btn">
                    <RefreshCw size={14} />
                    Sync Now
                  </button>
                  <button className="action-btn">
                    <Eye size={14} />
                    View Details
                  </button>
                  <button className="action-btn">
                    <Filter size={14} />
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiErpDashboard; 