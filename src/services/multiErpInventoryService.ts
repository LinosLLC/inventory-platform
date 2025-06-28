// Multi-ERP Inventory Service - Unified Stock Visibility Across ERPs

import { apiIntegrationService } from './apiIntegrationService';

// Unified Inventory Data Model
export interface UnifiedInventoryItem {
  id: string;
  materialId: string;
  materialName: string;
  materialDescription: string;
  materialGroup: {
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
  };
  plantId: string;
  plantName: string;
  location: string;
  warehouse: string;
  storageBin: string;
  batchNumber?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  leadTime: number;
  supplier: string;
  supplierId: string;
  lastUpdated: Date;
  lastMovement: Date;
  movementType: 'inbound' | 'outbound' | 'transfer' | 'adjustment';
  status: 'available' | 'reserved' | 'blocked' | 'quarantine';
  qualityStatus: 'good' | 'damaged' | 'expired' | 'pending';
  sourceSystem: {
    erp: string;
    systemId: string;
    originalId: string;
    syncTimestamp: Date;
  };
  customFields: Record<string, any>;
}

// ERP System Configuration
export interface ErpSystemConfig {
  id: string;
  name: string;
  type: 'sap_s4hana' | 'dynamics' | 'oracle' | 'netsuite' | 'sage' | 'custom';
  version: string;
  baseUrl: string;
  authentication: {
    method: 'basic' | 'bearer' | 'api-key' | 'oauth2' | 'saml';
    credentials: Record<string, any>;
  };
  endpoints: {
    inventory: string;
    materials: string;
    plants: string;
    suppliers: string;
    movements: string;
  };
  dataMapping: {
    materialId: string;
    materialName: string;
    plantId: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    materialGroup: {
      level1: string;
      level2: string;
      level3: string;
      level4: string;
      level5: string;
    };
  };
  syncSettings: {
    enabled: boolean;
    interval: number; // minutes
    lastSync: Date;
    status: 'active' | 'error' | 'disabled';
  };
}

// Cross-System Analytics
export interface CrossSystemAnalytics {
  totalInventoryValue: number;
  totalItems: number;
  lowStockItems: number;
  overstockItems: number;
  systemDistribution: Record<string, {
    itemCount: number;
    totalValue: number;
    lastSync: Date;
  }>;
  materialGroupDistribution: Record<string, {
    itemCount: number;
    totalValue: number;
    averageStockLevel: number;
  }>;
  plantDistribution: Record<string, {
    itemCount: number;
    totalValue: number;
    utilization: number;
  }>;
  supplierDistribution: Record<string, {
    itemCount: number;
    totalValue: number;
    averageLeadTime: number;
  }>;
}

// Stock Movement Tracking
export interface StockMovement {
  id: string;
  materialId: string;
  plantId: string;
  quantity: number;
  movementType: 'inbound' | 'outbound' | 'transfer' | 'adjustment';
  sourceSystem: string;
  sourceDocument: string;
  timestamp: Date;
  userId: string;
  reason: string;
  cost: number;
  destinationPlantId?: string;
  batchNumber?: string;
}

// Material Reconciliation
export interface MaterialReconciliation {
  materialId: string;
  materialName: string;
  discrepancies: {
    system: string;
    expectedQuantity: number;
    actualQuantity: number;
    difference: number;
    lastVerified: Date;
  }[];
  totalExpected: number;
  totalActual: number;
  totalDifference: number;
  status: 'reconciled' | 'discrepancy' | 'pending';
}

class MultiErpInventoryService {
  private apiIntegrationService = apiIntegrationService;
  private erpSystems: Map<string, ErpSystemConfig> = new Map();
  private unifiedInventory: Map<string, UnifiedInventoryItem> = new Map();
  private stockMovements: StockMovement[] = [];
  private reconciliations: MaterialReconciliation[] = [];
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDefaultErpSystems();
  }

  private initializeDefaultErpSystems() {
    // SAP S/4HANA Configuration
    const sapS4Hana: ErpSystemConfig = {
      id: 'sap_s4hana_main',
      name: 'SAP S/4HANA 2021',
      type: 'sap_s4hana',
      version: '2021',
      baseUrl: process.env.REACT_APP_SAP_BASE_URL || 'https://your-sap-system.com',
      authentication: {
        method: 'basic',
        credentials: {
          username: process.env.REACT_APP_SAP_USERNAME || 'demo_user',
          password: process.env.REACT_APP_SAP_PASSWORD || 'demo_pass',
          client: process.env.REACT_APP_SAP_CLIENT || '100'
        }
      },
      endpoints: {
        inventory: '/sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_MaterialStock',
        materials: '/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product',
        plants: '/sap/opu/odata/sap/API_PLANT_SRV/A_Plant',
        suppliers: '/sap/opu/odata/sap/API_BUSINESS_PARTNER_SRV/A_BusinessPartner',
        movements: '/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocument'
      },
      dataMapping: {
        materialId: 'Material',
        materialName: 'MaterialName',
        plantId: 'Plant',
        quantity: 'MaterialBaseUnit',
        unit: 'MaterialBaseUnit',
        unitPrice: 'StandardPrice',
        materialGroup: {
          level1: 'MaterialGroup',
          level2: 'MaterialGroup2',
          level3: 'MaterialGroup3',
          level4: 'MaterialGroup4',
          level5: 'MaterialGroup5'
        }
      },
      syncSettings: {
        enabled: true,
        interval: 5,
        lastSync: new Date(),
        status: 'active'
      }
    };

    // Microsoft Dynamics Configuration
    const dynamics365: ErpSystemConfig = {
      id: 'dynamics365_main',
      name: 'Microsoft Dynamics 365',
      type: 'dynamics',
      version: '2023',
      baseUrl: process.env.REACT_APP_DYNAMICS_BASE_URL || 'https://your-dynamics-instance.com',
      authentication: {
        method: 'bearer',
        credentials: {
          token: process.env.REACT_APP_DYNAMICS_TOKEN || 'demo_token'
        }
      },
      endpoints: {
        inventory: '/api/data/v9.2/products',
        materials: '/api/data/v9.2/products',
        plants: '/api/data/v9.2/warehouses',
        suppliers: '/api/data/v9.2/accounts',
        movements: '/api/data/v9.2/inventorytransactions'
      },
      dataMapping: {
        materialId: 'productnumber',
        materialName: 'name',
        plantId: 'warehouseid',
        quantity: 'quantityonhand',
        unit: 'defaultuomscheduleid',
        unitPrice: 'price',
        materialGroup: {
          level1: 'productcategoryid',
          level2: 'productsubcategoryid',
          level3: 'productfamilyid',
          level4: 'productlineid',
          level5: 'producttypeid'
        }
      },
      syncSettings: {
        enabled: true,
        interval: 10,
        lastSync: new Date(),
        status: 'active'
      }
    };

    // Oracle ERP Configuration
    const oracleErp: ErpSystemConfig = {
      id: 'oracle_erp_main',
      name: 'Oracle ERP Cloud',
      type: 'oracle',
      version: '2023',
      baseUrl: process.env.REACT_APP_ORACLE_BASE_URL || 'https://your-oracle-instance.com',
      authentication: {
        method: 'oauth2',
        credentials: {
          clientId: process.env.REACT_APP_ORACLE_CLIENT_ID || 'demo_client',
          clientSecret: process.env.REACT_APP_ORACLE_CLIENT_SECRET || 'demo_secret'
        }
      },
      endpoints: {
        inventory: '/fscmRestApi/resources/11.13.18.05/inventoryItems',
        materials: '/fscmRestApi/resources/11.13.18.05/items',
        plants: '/fscmRestApi/resources/11.13.18.05/organizations',
        suppliers: '/fscmRestApi/resources/11.13.18.05/suppliers',
        movements: '/fscmRestApi/resources/11.13.18.05/inventoryTransactions'
      },
      dataMapping: {
        materialId: 'ItemNumber',
        materialName: 'ItemDescription',
        plantId: 'OrganizationId',
        quantity: 'QuantityOnHand',
        unit: 'PrimaryUOMCode',
        unitPrice: 'UnitCost',
        materialGroup: {
          level1: 'ItemCategory',
          level2: 'ItemSubCategory',
          level3: 'ItemFamily',
          level4: 'ItemType',
          level5: 'ItemSubType'
        }
      },
      syncSettings: {
        enabled: true,
        interval: 15,
        lastSync: new Date(),
        status: 'active'
      }
    };

    this.erpSystems.set(sapS4Hana.id, sapS4Hana);
    this.erpSystems.set(dynamics365.id, dynamics365);
    this.erpSystems.set(oracleErp.id, oracleErp);
  }

  // ERP System Management
  async addErpSystem(config: Omit<ErpSystemConfig, 'id'>): Promise<string> {
    const id = `erp_${Date.now()}`;
    const erpSystem: ErpSystemConfig = {
      ...config,
      id,
      syncSettings: {
        ...config.syncSettings,
        lastSync: new Date(),
        status: 'active'
      }
    };
    
    this.erpSystems.set(id, erpSystem);
    
    if (erpSystem.syncSettings.enabled) {
      await this.startSync(id);
    }
    
    return id;
  }

  async updateErpSystem(id: string, updates: Partial<ErpSystemConfig>): Promise<void> {
    const system = this.erpSystems.get(id);
    if (!system) {
      throw new Error(`ERP system ${id} not found`);
    }
    
    const updatedSystem = { ...system, ...updates };
    this.erpSystems.set(id, updatedSystem);
    
    // Restart sync if settings changed
    if (updates.syncSettings) {
      await this.stopSync(id);
      if (updatedSystem.syncSettings.enabled) {
        await this.startSync(id);
      }
    }
  }

  async removeErpSystem(id: string): Promise<void> {
    await this.stopSync(id);
    this.erpSystems.delete(id);
  }

  async getErpSystem(id: string): Promise<ErpSystemConfig | null> {
    return this.erpSystems.get(id) || null;
  }

  async getAllErpSystems(): Promise<ErpSystemConfig[]> {
    return Array.from(this.erpSystems.values());
  }

  // Sync Management
  async startSync(erpSystemId: string): Promise<void> {
    const system = this.erpSystems.get(erpSystemId);
    if (!system || !system.syncSettings.enabled) {
      return;
    }

    // Stop existing sync if running
    await this.stopSync(erpSystemId);

    // Start new sync interval
    const interval = setInterval(async () => {
      try {
        await this.syncErpSystem(erpSystemId);
      } catch (error) {
        console.error(`Sync failed for ERP system ${erpSystemId}:`, error);
        system.syncSettings.status = 'error';
      }
    }, system.syncSettings.interval * 60 * 1000);

    this.syncIntervals.set(erpSystemId, interval);
    
    // Initial sync
    await this.syncErpSystem(erpSystemId);
  }

  async stopSync(erpSystemId: string): Promise<void> {
    const interval = this.syncIntervals.get(erpSystemId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(erpSystemId);
    }
  }

  private async syncErpSystem(erpSystemId: string): Promise<void> {
    const system = this.erpSystems.get(erpSystemId);
    if (!system) {
      throw new Error(`ERP system ${erpSystemId} not found`);
    }

    console.log(`Syncing ERP system: ${system.name}`);
    
    try {
      // Sync inventory data
      const inventoryData = await this.fetchInventoryFromErp(system);
      
      // Transform and normalize data
      const unifiedData = this.normalizeInventoryData(inventoryData, system);
      
      // Update unified inventory
      unifiedData.forEach(item => {
        const key = `${item.materialId}-${item.plantId}-${item.sourceSystem.erp}`;
        this.unifiedInventory.set(key, item);
      });

      // Update sync status
      system.syncSettings.lastSync = new Date();
      system.syncSettings.status = 'active';
      
      console.log(`Sync completed for ${system.name}: ${unifiedData.length} items`);
    } catch (error) {
      system.syncSettings.status = 'error';
      throw error;
    }
  }

  private async fetchInventoryFromErp(system: ErpSystemConfig): Promise<any[]> {
    // This would be implemented based on the specific ERP system
    // For now, return mock data
    return this.generateMockInventoryData(system);
  }

  private generateMockInventoryData(system: ErpSystemConfig): any[] {
    const mockData: any[] = [];
    const materials = [
      { id: 'AL001', name: 'Aluminium Sheets 2mm', group: 'Building Materials/Aluminium/Sheets/2mm/Standard' },
      { id: 'AL002', name: 'Aluminium Profiles 6063', group: 'Building Materials/Aluminium/Profiles/6063/Extruded' },
      { id: 'HW001', name: 'Stainless Steel Screws M6', group: 'Hardware/Fasteners/Screws/Stainless/M6' },
      { id: 'ST001', name: 'Steel Beams I-Beam 200mm', group: 'Construction/Steel/Beams/I-Beam/200mm' }
    ];

    const plants = ['PLANT001', 'PLANT002', 'PLANT003'];
    const suppliers = ['SUPPLIER001', 'SUPPLIER002', 'SUPPLIER003'];

    materials.forEach(material => {
      plants.forEach(plant => {
        const quantity = Math.floor(Math.random() * 10000) + 100;
        const unitPrice = Math.random() * 100 + 10;
        
        mockData.push({
          [system.dataMapping.materialId]: material.id,
          [system.dataMapping.materialName]: material.name,
          [system.dataMapping.plantId]: plant,
          [system.dataMapping.quantity]: quantity,
          [system.dataMapping.unit]: 'PCS',
          [system.dataMapping.unitPrice]: unitPrice,
          MaterialGroup: material.group.split('/')[0],
          MaterialGroup2: material.group.split('/')[1],
          MaterialGroup3: material.group.split('/')[2],
          MaterialGroup4: material.group.split('/')[3],
          MaterialGroup5: material.group.split('/')[4],
          Supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
          LastUpdated: new Date(),
          Status: 'available'
        });
      });
    });

    return mockData;
  }

  private normalizeInventoryData(rawData: any[], system: ErpSystemConfig): UnifiedInventoryItem[] {
    return rawData.map(item => {
      const materialGroups = item.MaterialGroup ? item.MaterialGroup.split('/') : [];
      
      return {
        id: `${item[system.dataMapping.materialId]}-${item[system.dataMapping.plantId]}-${system.id}`,
        materialId: item[system.dataMapping.materialId],
        materialName: item[system.dataMapping.materialName],
        materialDescription: item[system.dataMapping.materialName],
        materialGroup: {
          level1: materialGroups[0] || '',
          level2: materialGroups[1] || '',
          level3: materialGroups[2] || '',
          level4: materialGroups[3] || '',
          level5: materialGroups[4] || ''
        },
        plantId: item[system.dataMapping.plantId],
        plantName: `Plant ${item[system.dataMapping.plantId]}`,
        location: 'Main Warehouse',
        warehouse: 'WH001',
        storageBin: 'A01-01-01',
        quantity: item[system.dataMapping.quantity],
        unit: item[system.dataMapping.unit],
        unitPrice: item[system.dataMapping.unitPrice],
        totalValue: item[system.dataMapping.quantity] * item[system.dataMapping.unitPrice],
        minStockLevel: 100,
        maxStockLevel: 5000,
        reorderPoint: 200,
        leadTime: 7,
        supplier: item.Supplier,
        supplierId: item.Supplier,
        lastUpdated: new Date(item.LastUpdated),
        lastMovement: new Date(),
        movementType: 'inbound',
        status: item.Status,
        qualityStatus: 'good',
        sourceSystem: {
          erp: system.name,
          systemId: system.id,
          originalId: item[system.dataMapping.materialId],
          syncTimestamp: new Date()
        },
        customFields: {}
      };
    });
  }

  // Unified Inventory Queries
  async getUnifiedInventory(filters?: {
    materialId?: string;
    plantId?: string;
    erpSystem?: string;
    materialGroup?: string;
    status?: string;
  }): Promise<UnifiedInventoryItem[]> {
    let items = Array.from(this.unifiedInventory.values());

    if (filters) {
      if (filters.materialId) {
        items = items.filter(item => item.materialId.includes(filters.materialId!));
      }
      if (filters.plantId) {
        items = items.filter(item => item.plantId === filters.plantId);
      }
      if (filters.erpSystem) {
        items = items.filter(item => item.sourceSystem.erp === filters.erpSystem);
      }
      if (filters.materialGroup) {
        items = items.filter(item => 
          item.materialGroup.level1 === filters.materialGroup ||
          item.materialGroup.level2 === filters.materialGroup ||
          item.materialGroup.level3 === filters.materialGroup
        );
      }
      if (filters.status) {
        items = items.filter(item => item.status === filters.status);
      }
    }

    return items;
  }

  async getInventoryByMaterial(materialId: string): Promise<UnifiedInventoryItem[]> {
    return Array.from(this.unifiedInventory.values())
      .filter(item => item.materialId === materialId);
  }

  async getInventoryByPlant(plantId: string): Promise<UnifiedInventoryItem[]> {
    return Array.from(this.unifiedInventory.values())
      .filter(item => item.plantId === plantId);
  }

  async getInventoryByErpSystem(erpSystemId: string): Promise<UnifiedInventoryItem[]> {
    return Array.from(this.unifiedInventory.values())
      .filter(item => item.sourceSystem.systemId === erpSystemId);
  }

  // Cross-System Analytics
  async getCrossSystemAnalytics(): Promise<CrossSystemAnalytics> {
    const items = Array.from(this.unifiedInventory.values());
    
    const totalInventoryValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    const totalItems = items.length;
    const lowStockItems = items.filter(item => item.quantity <= item.reorderPoint).length;
    const overstockItems = items.filter(item => item.quantity >= item.maxStockLevel).length;

    // System distribution
    const systemDistribution: Record<string, any> = {};
    items.forEach(item => {
      const systemName = item.sourceSystem.erp;
      if (!systemDistribution[systemName]) {
        systemDistribution[systemName] = {
          itemCount: 0,
          totalValue: 0,
          lastSync: new Date()
        };
      }
      systemDistribution[systemName].itemCount++;
      systemDistribution[systemName].totalValue += item.totalValue;
    });

    // Material group distribution
    const materialGroupDistribution: Record<string, any> = {};
    items.forEach(item => {
      const group = item.materialGroup.level1;
      if (!materialGroupDistribution[group]) {
        materialGroupDistribution[group] = {
          itemCount: 0,
          totalValue: 0,
          averageStockLevel: 0
        };
      }
      materialGroupDistribution[group].itemCount++;
      materialGroupDistribution[group].totalValue += item.totalValue;
      materialGroupDistribution[group].averageStockLevel += item.quantity;
    });

    // Calculate averages
    Object.keys(materialGroupDistribution).forEach(group => {
      const count = materialGroupDistribution[group].itemCount;
      materialGroupDistribution[group].averageStockLevel /= count;
    });

    // Plant distribution
    const plantDistribution: Record<string, any> = {};
    items.forEach(item => {
      const plant = item.plantName;
      if (!plantDistribution[plant]) {
        plantDistribution[plant] = {
          itemCount: 0,
          totalValue: 0,
          utilization: 0
        };
      }
      plantDistribution[plant].itemCount++;
      plantDistribution[plant].totalValue += item.totalValue;
      plantDistribution[plant].utilization += (item.quantity / item.maxStockLevel);
    });

    // Calculate utilization percentages
    Object.keys(plantDistribution).forEach(plant => {
      const count = plantDistribution[plant].itemCount;
      plantDistribution[plant].utilization = (plantDistribution[plant].utilization / count) * 100;
    });

    // Supplier distribution
    const supplierDistribution: Record<string, any> = {};
    items.forEach(item => {
      const supplier = item.supplier;
      if (!supplierDistribution[supplier]) {
        supplierDistribution[supplier] = {
          itemCount: 0,
          totalValue: 0,
          averageLeadTime: 0
        };
      }
      supplierDistribution[supplier].itemCount++;
      supplierDistribution[supplier].totalValue += item.totalValue;
      supplierDistribution[supplier].averageLeadTime += item.leadTime;
    });

    // Calculate average lead times
    Object.keys(supplierDistribution).forEach(supplier => {
      const count = supplierDistribution[supplier].itemCount;
      supplierDistribution[supplier].averageLeadTime /= count;
    });

    return {
      totalInventoryValue,
      totalItems,
      lowStockItems,
      overstockItems,
      systemDistribution,
      materialGroupDistribution,
      plantDistribution,
      supplierDistribution
    };
  }

  // Stock Movement Tracking
  async addStockMovement(movement: Omit<StockMovement, 'id'>): Promise<string> {
    const id = `movement_${Date.now()}`;
    const newMovement: StockMovement = {
      ...movement,
      id
    };
    
    this.stockMovements.push(newMovement);
    
    // Update inventory levels
    const key = `${movement.materialId}-${movement.plantId}-${movement.sourceSystem}`;
    const item = this.unifiedInventory.get(key);
    if (item) {
      if (movement.movementType === 'inbound') {
        item.quantity += movement.quantity;
      } else if (movement.movementType === 'outbound') {
        item.quantity -= movement.quantity;
      }
      item.lastMovement = movement.timestamp;
      item.lastUpdated = new Date();
    }
    
    return id;
  }

  async getStockMovements(filters?: {
    materialId?: string;
    plantId?: string;
    movementType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<StockMovement[]> {
    let movements = [...this.stockMovements];

    if (filters) {
      if (filters.materialId) {
        movements = movements.filter(m => m.materialId === filters.materialId);
      }
      if (filters.plantId) {
        movements = movements.filter(m => m.plantId === filters.plantId);
      }
      if (filters.movementType) {
        movements = movements.filter(m => m.movementType === filters.movementType);
      }
      if (filters.startDate) {
        movements = movements.filter(m => m.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        movements = movements.filter(m => m.timestamp <= filters.endDate!);
      }
    }

    return movements.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Material Reconciliation
  async reconcileMaterial(materialId: string): Promise<MaterialReconciliation> {
    const items = await this.getInventoryByMaterial(materialId);
    const systems = Array.from(new Set(items.map(item => item.sourceSystem.erp)));
    
    const discrepancies = systems.map(system => {
      const systemItems = items.filter(item => item.sourceSystem.erp === system);
      const expectedQuantity = systemItems.reduce((sum, item) => sum + item.quantity, 0);
      const actualQuantity = expectedQuantity; // In real implementation, this would be fetched from the ERP
      
      return {
        system,
        expectedQuantity,
        actualQuantity,
        difference: actualQuantity - expectedQuantity,
        lastVerified: new Date()
      };
    });

    const totalExpected = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalActual = discrepancies.reduce((sum, d) => sum + d.actualQuantity, 0);
    const totalDifference = totalActual - totalExpected;

    const reconciliation: MaterialReconciliation = {
      materialId,
      materialName: items[0]?.materialName || '',
      discrepancies,
      totalExpected,
      totalActual,
      totalDifference,
      status: totalDifference === 0 ? 'reconciled' : 'discrepancy'
    };

    // Update or add to reconciliations
    const existingIndex = this.reconciliations.findIndex(r => r.materialId === materialId);
    if (existingIndex >= 0) {
      this.reconciliations[existingIndex] = reconciliation;
    } else {
      this.reconciliations.push(reconciliation);
    }

    return reconciliation;
  }

  async getReconciliations(): Promise<MaterialReconciliation[]> {
    return this.reconciliations;
  }

  // System Health and Status
  async getSystemHealth(): Promise<{
    totalSystems: number;
    activeSystems: number;
    errorSystems: number;
    lastSyncTime: Date;
    systems: Array<{
      id: string;
      name: string;
      status: string;
      lastSync: Date;
      itemCount: number;
      errorCount: number;
    }>;
  }> {
    const systems = Array.from(this.erpSystems.values());
    const activeSystems = systems.filter(s => s.syncSettings.status === 'active').length;
    const errorSystems = systems.filter(s => s.syncSettings.status === 'error').length;

    const systemDetails = systems.map(system => {
      const items = Array.from(this.unifiedInventory.values())
        .filter(item => item.sourceSystem.systemId === system.id);
      
      return {
        id: system.id,
        name: system.name,
        status: system.syncSettings.status,
        lastSync: system.syncSettings.lastSync,
        itemCount: items.length,
        errorCount: 0 // In real implementation, this would track actual errors
      };
    });

    return {
      totalSystems: systems.length,
      activeSystems,
      errorSystems,
      lastSyncTime: new Date(Math.max(...systems.map(s => s.syncSettings.lastSync.getTime()))),
      systems: systemDetails
    };
  }

  // Export and Reporting
  async exportInventoryReport(format: 'csv' | 'json' | 'excel'): Promise<string> {
    const items = Array.from(this.unifiedInventory.values());
    
    if (format === 'json') {
      return JSON.stringify(items, null, 2);
    } else if (format === 'csv') {
      const headers = [
        'Material ID', 'Material Name', 'Plant', 'Quantity', 'Unit', 'Unit Price', 
        'Total Value', 'ERP System', 'Last Updated', 'Status'
      ];
      const rows = items.map(item => [
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
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
    
    return 'Export format not supported';
  }
}

export default MultiErpInventoryService;
