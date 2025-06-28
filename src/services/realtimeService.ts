import { RealTimeUpdate, AiInsight } from '../types';

class RealtimeService {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isSimulating = false;

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    if (this.isSimulating) return;
    this.isSimulating = true;
    console.log('Starting simulated real-time updates');
    
    // Simulate stock updates every 30 seconds
    const stockInterval = setInterval(() => {
      const mockStockUpdate: RealTimeUpdate = {
        type: 'stock',
        plantId: 'plant001',
        productId: 'product001',
        data: {
          quantity: Math.floor(Math.random() * 1000) + 2000,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      };
      this.notifyListeners('stock_update', mockStockUpdate);
    }, 30000);
    this.intervals.set('stock', stockInterval);

    // Simulate efficiency updates every 60 seconds
    const efficiencyInterval = setInterval(() => {
      const mockEfficiencyUpdate: RealTimeUpdate = {
        type: 'efficiency',
        plantId: 'plant001',
        data: {
          efficiency: Math.floor(Math.random() * 10) + 85,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      };
      this.notifyListeners('efficiency_update', mockEfficiencyUpdate);
    }, 60000);
    this.intervals.set('efficiency', efficiencyInterval);

    // Simulate AI insights every 2 minutes
    const insightInterval = setInterval(() => {
      const mockInsight: AiInsight = {
        id: `insight_${Date.now()}`,
        type: 'alert',
        title: 'Stock Level Alert',
        description: 'SKU-001 is approaching minimum stock level',
        confidence: Math.floor(Math.random() * 20) + 80,
        impact: 'medium',
        timestamp: new Date().toISOString(),
        category: 'inventory',
        priority: Math.floor(Math.random() * 5) + 1,
        isRead: false,
        actionRequired: true,
      };
      this.notifyListeners('ai_insight', mockInsight);
    }, 120000);
    this.intervals.set('insight', insightInterval);

    // Simulate system health updates every 45 seconds
    const systemInterval = setInterval(() => {
      const mockSystemUpdate: RealTimeUpdate = {
        type: 'system',
        data: {
          sap: Math.random() > 0.1 ? 'connected' : 'warning',
          commerce: Math.random() > 0.05 ? 'connected' : 'disconnected',
          legacy: Math.random() > 0.15 ? 'connected' : 'warning',
          ai: Math.random() > 0.05 ? 'optimal' : 'degraded',
          lastChecked: new Date(),
        },
        timestamp: new Date(),
      };
      this.notifyListeners('system_update', mockSystemUpdate);
    }, 45000);
    this.intervals.set('system', systemInterval);
  }

  public subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in real-time listener:', error);
        }
      });
    }
  }

  public emit(event: string, data: any) {
    // In a real implementation, this would send data to the server
    console.log(`Emitting ${event}:`, data);
    this.notifyListeners(event, data);
  }

  public disconnect() {
    this.isSimulating = false;
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.listeners.clear();
  }

  public isConnected(): boolean {
    return this.isSimulating;
  }

  public getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' | 'error' {
    return this.isSimulating ? 'connected' : 'disconnected';
  }

  // Manual trigger for testing
  public triggerUpdate(type: string, data: any) {
    this.notifyListeners(type, data);
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
export default realtimeService; 