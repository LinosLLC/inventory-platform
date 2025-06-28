import { 
  Forecast, 
  ForecastRecommendation, 
  ForecastingConfig, 
  HistoricalData, 
  ForecastComparison,
  SeasonalAnalysis,
  TrendAnalysis,
  Product,
  Plant
} from '../types';

class ForecastingService {
  private configs: Map<string, ForecastingConfig> = new Map();
  private historicalData: Map<string, HistoricalData[]> = new Map();
  private forecasts: Map<string, Forecast> = new Map();

  // Building materials industry specific data
  private buildingMaterialsCategories = {
    aluminium: {
      products: ['Aluminium-Sheets-001', 'Aluminium-Profiles-002', 'Aluminium-Coils-003'],
      seasonalFactors: { spring: 1.3, summer: 1.1, fall: 0.9, winter: 0.7 },
      constructionSeason: { start: 3, end: 10 },
      priceVolatility: 0.15
    },
    hardware: {
      products: ['Hardware-Screws-001', 'Hardware-Bolts-002', 'Hardware-Hinges-003'],
      seasonalFactors: { spring: 1.2, summer: 1.0, fall: 0.8, winter: 0.6 },
      constructionSeason: { start: 2, end: 11 },
      priceVolatility: 0.08
    },
    construction: {
      products: ['Steel-Beams-001', 'Concrete-Mix-002', 'Lumber-2x4-003'],
      seasonalFactors: { spring: 1.4, summer: 1.2, fall: 0.9, winter: 0.5 },
      constructionSeason: { start: 3, end: 10 },
      priceVolatility: 0.12
    }
  };

  constructor() {
    this.initializeBuildingMaterialsConfigs();
    this.loadBuildingMaterialsHistoricalData();
  }

  private initializeBuildingMaterialsConfigs() {
    const buildingMaterialsConfigs: ForecastingConfig[] = [
      {
        id: 'aluminium_config',
        name: 'Aluminium Industry LSTM',
        algorithm: 'lstm',
        parameters: {
          layers: [64, 32, 16],
          epochs: 150,
          batchSize: 32,
          lookback: 60,
          constructionFactors: true,
          commodityPrices: true
        },
        horizon: 90,
        confidenceLevel: 92,
        seasonalityDetection: true,
        anomalyDetection: true,
        externalFactors: true,
        autoRetrain: true,
        retrainInterval: 7,
        lastRetrain: new Date(),
        accuracy: 91.5,
        isActive: true
      },
      {
        id: 'hardware_config',
        name: 'Hardware Supply Chain ARIMA',
        algorithm: 'arima',
        parameters: {
          p: 2,
          d: 1,
          q: 2,
          seasonal: true,
          seasonalPeriod: 12,
          constructionDemand: true
        },
        horizon: 60,
        confidenceLevel: 88,
        seasonalityDetection: true,
        anomalyDetection: true,
        externalFactors: true,
        autoRetrain: true,
        retrainInterval: 14,
        lastRetrain: new Date(),
        accuracy: 87.3,
        isActive: true
      },
      {
        id: 'construction_ensemble',
        name: 'Construction Materials Ensemble',
        algorithm: 'ensemble',
        parameters: {
          models: ['lstm', 'arima', 'prophet'],
          weights: [0.45, 0.35, 0.20],
          voting: 'weighted',
          constructionIndex: true,
          weatherImpact: true,
          permitData: true
        },
        horizon: 120,
        confidenceLevel: 95,
        seasonalityDetection: true,
        anomalyDetection: true,
        externalFactors: true,
        autoRetrain: true,
        retrainInterval: 7,
        lastRetrain: new Date(),
        accuracy: 94.2,
        isActive: true
      }
    ];

    buildingMaterialsConfigs.forEach(config => this.configs.set(config.id, config));
  }

  private loadBuildingMaterialsHistoricalData() {
    const aluminiumProducts = ['Aluminium-Sheets-001', 'Aluminium-Profiles-002', 'Aluminium-Coils-003'];
    const hardwareProducts = ['Hardware-Screws-001', 'Hardware-Bolts-002', 'Hardware-Hinges-003'];
    const constructionProducts = ['Steel-Beams-001', 'Concrete-Mix-002', 'Lumber-2x4-003'];
    
    const plants = ['plant001', 'plant002', 'plant003', 'plant004'];
    
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);

    [...aluminiumProducts, ...hardwareProducts, ...constructionProducts].forEach(productId => {
      plants.forEach(plantId => {
        const key = `${productId}-${plantId}`;
        const data: HistoricalData[] = [];
        
        for (let i = 0; i < 730; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          
          const category = this.getProductCategory(productId);
          const baseDemand = this.getBaseDemand(productId, category);
          const seasonalFactor = this.calculateBuildingMaterialsSeasonality(date, category);
          const constructionFactor = this.calculateConstructionDemand(date);
          const economicFactor = this.calculateEconomicFactor(date);
          const weatherFactor = this.calculateWeatherFactor(date);
          
          const demand = Math.round(baseDemand * seasonalFactor * constructionFactor * economicFactor * weatherFactor);
          
          data.push({
            id: `hist_${key}_${i}`,
            productId,
            plantId,
            date,
            demand,
            supply: Math.round(demand * (0.85 + Math.random() * 0.3)),
            stock: Math.round(demand * (1.2 + Math.random() * 0.8)),
            price: this.calculateBuildingMaterialsPrice(productId, date),
            weather: {
              temperature: this.getSeasonalTemperature(date),
              humidity: 40 + Math.random() * 40,
              precipitation: this.getSeasonalPrecipitation(date)
            },
            events: this.getBuildingMaterialsEvents(date),
            holidays: this.getConstructionHolidays(date),
            economicIndicators: {
              gdp: 2.0 + Math.random() * 3,
              inflation: 2.0 + Math.random() * 4,
              unemployment: 3.5 + Math.random() * 4,
              constructionIndex: this.getConstructionIndex(date),
              housingStarts: this.getHousingStarts(date),
              buildingPermits: this.getBuildingPermits(date)
            }
          });
        }
        
        this.historicalData.set(key, data);
      });
    });
  }

  private getProductCategory(productId: string): 'aluminium' | 'hardware' | 'construction' {
    if (productId.includes('Aluminium')) return 'aluminium';
    if (productId.includes('Hardware')) return 'hardware';
    return 'construction';
  }

  private getBaseDemand(productId: string, category: string): number {
    const baseDemands: Record<string, Record<string, number>> = {
      aluminium: {
        'Aluminium-Sheets-001': 500,
        'Aluminium-Profiles-002': 300,
        'Aluminium-Coils-003': 800
      },
      hardware: {
        'Hardware-Screws-001': 2000,
        'Hardware-Bolts-002': 1500,
        'Hardware-Hinges-003': 800
      },
      construction: {
        'Steel-Beams-001': 200,
        'Concrete-Mix-002': 1000,
        'Lumber-2x4-003': 1500
      }
    };
    
    return baseDemands[category]?.[productId] || 500;
  }

  private calculateBuildingMaterialsSeasonality(date: Date, category: string): number {
    const month = date.getMonth();
    const season = this.getSeason(month);
    
    const categoryData = this.buildingMaterialsCategories[category as keyof typeof this.buildingMaterialsCategories];
    const seasonalFactors = categoryData?.seasonalFactors;
    const baseSeasonal = seasonalFactors?.[season as keyof typeof seasonalFactors] || 1.0;
    
    const constructionSeason = categoryData?.constructionSeason;
    const isConstructionSeason = constructionSeason && 
      (month >= constructionSeason.start - 1 && month <= constructionSeason.end - 1);
    
    const constructionBoost = isConstructionSeason ? 1.2 : 0.8;
    const monthlyVariation = 1 + 0.1 * Math.sin((month / 12) * 2 * Math.PI);
    
    return baseSeasonal * constructionBoost * monthlyVariation;
  }

  private calculateConstructionDemand(date: Date): number {
    const month = date.getMonth();
    const dayOfWeek = date.getDay();
    
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
    const seasonalFactor = 1 + 0.3 * Math.sin((month / 12) * 2 * Math.PI);
    const weatherFactor = this.getWeatherConstructionFactor(date);
    
    return weekendFactor * seasonalFactor * weatherFactor;
  }

  private calculateEconomicFactor(date: Date): number {
    const year = date.getFullYear();
    const economicGrowth = (year - 2020) * 0.02;
    return 1 + economicGrowth + (Math.random() - 0.5) * 0.1;
  }

  private calculateWeatherFactor(date: Date): number {
    const temp = this.getSeasonalTemperature(date);
    const precip = this.getSeasonalPrecipitation(date);
    
    if (temp < 0 || temp > 35) return 0.6;
    if (precip > 10) return 0.7;
    if (precip > 5) return 0.85;
    
    return 1.0;
  }

  private calculateBuildingMaterialsPrice(productId: string, date: Date): number {
    const category = this.getProductCategory(productId);
    const basePrice = this.getBasePrice(productId);
    const categoryData = this.buildingMaterialsCategories[category as keyof typeof this.buildingMaterialsCategories];
    const volatility = categoryData?.priceVolatility || 0.1;
    
    const commodityFactor = 1 + (Math.random() - 0.5) * volatility;
    const seasonalPriceFactor = 1 + 0.05 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
    const inflationFactor = 1 + (date.getFullYear() - 2020) * 0.03;
    
    return Math.round(basePrice * commodityFactor * seasonalPriceFactor * inflationFactor * 100) / 100;
  }

  private getBasePrice(productId: string): number {
    const basePrices: Record<string, number> = {
      'Aluminium-Sheets-001': 2.50,
      'Aluminium-Profiles-002': 3.20,
      'Aluminium-Coils-003': 1.80,
      'Hardware-Screws-001': 0.15,
      'Hardware-Bolts-002': 0.25,
      'Hardware-Hinges-003': 1.20,
      'Steel-Beams-001': 45.00,
      'Concrete-Mix-002': 8.50,
      'Lumber-2x4-003': 3.75
    };
    
    return basePrices[productId] || 5.00;
  }

  private getSeason(month: number): 'spring' | 'summer' | 'fall' | 'winter' {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private getSeasonalTemperature(date: Date): number {
    const month = date.getMonth();
    const baseTemp = 15;
    const seasonalVariation = 20;
    return baseTemp + seasonalVariation * Math.sin((month / 12) * 2 * Math.PI) + (Math.random() - 0.5) * 10;
  }

  private getSeasonalPrecipitation(date: Date): number {
    const month = date.getMonth();
    const seasonalPrecip = 5 + 3 * Math.sin((month / 12) * 2 * Math.PI + Math.PI);
    return Math.max(0, seasonalPrecip + (Math.random() - 0.5) * 5);
  }

  private getWeatherConstructionFactor(date: Date): number {
    const temp = this.getSeasonalTemperature(date);
    const precip = this.getSeasonalPrecipitation(date);
    
    if (temp < 0 || temp > 35) return 0.6;
    if (precip > 10) return 0.7;
    if (precip > 5) return 0.85;
    
    return 1.0;
  }

  private getBuildingMaterialsEvents(date: Date): string[] {
    const events: string[] = [];
    const month = date.getMonth();
    const day = date.getDate();
    
    if (month === 2 && day >= 15 && day <= 20) events.push('International Building Materials Expo');
    if (month === 5 && day >= 10 && day <= 15) events.push('Construction Industry Conference');
    if (month === 9 && day >= 20 && day <= 25) events.push('Hardware Manufacturers Show');
    if (month === 6 && day >= 1 && day <= 7) events.push('Summer Construction Sale');
    if (month === 11 && day >= 20 && day <= 30) events.push('Year-End Inventory Clearance');
    
    return events;
  }

  private getConstructionHolidays(date: Date): string[] {
    const month = date.getMonth();
    const day = date.getDate();
    
    const holidays: string[] = [];
    
    if (month === 11 && day === 25) holidays.push('Christmas');
    if (month === 0 && day === 1) holidays.push('New Year');
    if (month === 6 && day === 4) holidays.push('Independence Day');
    if (month === 8 && day === 5) holidays.push('Labor Day');
    if (month === 10 && day === 24) holidays.push('Thanksgiving');
    
    return holidays;
  }

  private getConstructionIndex(date: Date): number {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const baseIndex = 100;
    const seasonalFactor = 1 + 0.2 * Math.sin((month / 12) * 2 * Math.PI);
    const economicGrowth = (year - 2020) * 0.02;
    
    return Math.round(baseIndex * seasonalFactor * (1 + economicGrowth));
  }

  private getHousingStarts(date: Date): number {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const seasonalFactor = 1 + 0.4 * Math.sin((month / 12) * 2 * Math.PI);
    const baseStarts = 1500;
    const annualGrowth = (year - 2020) * 0.03;
    
    return Math.round(baseStarts * seasonalFactor * (1 + annualGrowth));
  }

  private getBuildingPermits(date: Date): number {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const seasonalFactor = 1 + 0.3 * Math.sin(((month + 1) / 12) * 2 * Math.PI);
    const basePermits = 1800;
    const annualGrowth = (year - 2020) * 0.025;
    
    return Math.round(basePermits * seasonalFactor * (1 + annualGrowth));
  }

  async generateForecast(
    productId: string, 
    plantId: string, 
    configId: string = 'construction_ensemble'
  ): Promise<Forecast> {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Forecasting configuration ${configId} not found`);
    }

    const historicalKey = `${productId}-${plantId}`;
    const historicalData = this.historicalData.get(historicalKey);
    if (!historicalData) {
      throw new Error(`No historical data found for ${historicalKey}`);
    }

    const forecast = await this.runBuildingMaterialsForecast(historicalData, config);
    forecast.recommendations = this.generateBuildingMaterialsRecommendations(forecast, historicalData);
    
    this.forecasts.set(`${productId}-${plantId}-${configId}`, forecast);
    
    return forecast;
  }

  private async runBuildingMaterialsForecast(
    historicalData: HistoricalData[], 
    config: ForecastingConfig
  ): Promise<Forecast> {
    const recentData = historicalData.slice(-90);
    const demandSeries = recentData.map(d => d.demand);
    
    let predictedDemand: number[];
    let confidenceInterval: { lower: number[]; upper: number[] };
    let modelMetrics: any;
    
    switch (config.algorithm) {
      case 'lstm':
        ({ predictedDemand, confidenceInterval, modelMetrics } = this.runLSTMModel(demandSeries, config));
        break;
      case 'arima':
        ({ predictedDemand, confidenceInterval, modelMetrics } = this.runARIMAModel(demandSeries, config));
        break;
      case 'ensemble':
        ({ predictedDemand, confidenceInterval, modelMetrics } = this.runEnsembleModel(demandSeries, config));
        break;
      case 'prophet':
        ({ predictedDemand, confidenceInterval, modelMetrics } = this.runProphetModel(demandSeries, config));
        break;
      case 'exponential_smoothing':
        ({ predictedDemand, confidenceInterval, modelMetrics } = this.runExponentialSmoothing(demandSeries, config));
        break;
      default:
        throw new Error(`Unsupported algorithm: ${config.algorithm}`);
    }

    const seasonality = this.detectConstructionSeasonality(demandSeries);
    const trend = this.detectConstructionTrend(demandSeries);
    const anomalies = this.detectBuildingMaterialsAnomalies(demandSeries);

    return {
      id: `forecast_${Date.now()}`,
      productId: historicalData[0].productId,
      plantId: historicalData[0].plantId,
      period: 'daily',
      startDate: new Date(),
      endDate: new Date(Date.now() + config.horizon * 24 * 60 * 60 * 1000),
      predictedDemand,
      confidenceInterval,
      accuracy: config.accuracy,
      algorithm: config.algorithm,
      lastUpdated: new Date(),
      seasonality,
      trend,
      anomalies,
      modelMetrics,
      externalFactors: this.calculateBuildingMaterialsExternalFactors(historicalData)
    };
  }

  private detectConstructionSeasonality(demandSeries: number[]) {
    return {
      detected: true,
      period: 365,
      strength: 0.7 + Math.random() * 0.3,
      type: 'additive' as const
    };
  }

  private detectConstructionTrend(demandSeries: number[]) {
    const trend = this.calculateTrend(demandSeries);
    const strength = Math.abs(trend);
    
    let direction: 'increasing' | 'decreasing' | 'stable';
    if (trend > 0.01) direction = 'increasing';
    else if (trend < -0.01) direction = 'decreasing';
    else direction = 'stable';
    
    return {
      direction,
      slope: trend,
      strength: Math.min(strength * 100, 1),
      changePoints: this.findChangePoints(demandSeries)
    };
  }

  private detectBuildingMaterialsAnomalies(demandSeries: number[]) {
    const mean = demandSeries.reduce((a, b) => a + b, 0) / demandSeries.length;
    const std = Math.sqrt(demandSeries.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / demandSeries.length);
    const threshold = 2.5;
    
    const anomalies: Date[] = [];
    const severity: number[] = [];
    
    demandSeries.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / std);
      if (zScore > threshold) {
        const date = new Date();
        date.setDate(date.getDate() - (demandSeries.length - index));
        anomalies.push(date);
        severity.push(zScore);
      }
    });
    
    return {
      detected: anomalies.length > 0,
      points: anomalies,
      severity
    };
  }

  private calculateBuildingMaterialsExternalFactors(historicalData: HistoricalData[]) {
    const recentData = historicalData.slice(-30);
    
    return {
      weather: this.calculateWeatherImpact(recentData),
      holidays: this.calculateHolidayImpact(recentData),
      events: this.calculateEventImpact(recentData),
      economic: this.calculateEconomicImpact(recentData)
    };
  }

  private generateBuildingMaterialsRecommendations(forecast: Forecast, historicalData: HistoricalData[]): ForecastRecommendation[] {
    const recommendations: ForecastRecommendation[] = [];
    
    const avgPredictedDemand = forecast.predictedDemand.reduce((a, b) => a + b, 0) / forecast.predictedDemand.length;
    const currentStock = historicalData[historicalData.length - 1]?.stock || 0;
    const currentDemand = historicalData[historicalData.length - 1]?.demand || 0;
    const productId = forecast.productId;
    const category = this.getProductCategory(productId);
    
    const currentMonth = new Date().getMonth();
    const isApproachingConstructionSeason = currentMonth >= 1 && currentMonth <= 2;
    
    if (isApproachingConstructionSeason && avgPredictedDemand > currentDemand * 1.3) {
      recommendations.push({
        id: `rec_${Date.now()}_1`,
        type: 'production',
        title: 'Prepare for Construction Season',
        description: `Construction season approaching - predicted ${Math.round((avgPredictedDemand / currentDemand - 1) * 100)}% demand increase`,
        impact: 'high',
        confidence: forecast.accuracy,
        suggestedAction: 'Increase production capacity and stockpile inventory',
        expectedOutcome: 'Meet seasonal construction demand and capture market share',
        costBenefit: {
          cost: 75000,
          benefit: 250000,
          roi: 233
        }
      });
    }
    
    if (currentStock < avgPredictedDemand * 0.4) {
      recommendations.push({
        id: `rec_${Date.now()}_2`,
        type: 'procurement',
        title: 'Urgent Material Procurement',
        description: 'Insufficient stock for upcoming construction demand',
        impact: 'high',
        confidence: forecast.accuracy,
        suggestedAction: 'Place bulk orders with suppliers and secure delivery commitments',
        expectedOutcome: 'Prevent project delays and maintain customer relationships',
        costBenefit: {
          cost: 50000,
          benefit: 180000,
          roi: 260
        }
      });
    }
    
    if (currentStock > avgPredictedDemand * 2.5) {
      recommendations.push({
        id: `rec_${Date.now()}_3`,
        type: 'inventory',
        title: 'Optimize Seasonal Inventory',
        description: 'Excess inventory detected - consider promotional pricing',
        impact: 'medium',
        confidence: forecast.accuracy,
        suggestedAction: 'Implement promotional pricing and bulk discounts',
        expectedOutcome: 'Reduce carrying costs and improve cash flow',
        costBenefit: {
          cost: 15000,
          benefit: 60000,
          roi: 300
        }
      });
    }
    
    if (category === 'aluminium' && forecast.trend?.direction === 'increasing') {
      recommendations.push({
        id: `rec_${Date.now()}_4`,
        type: 'pricing',
        title: 'Aluminium Price Hedging',
        description: 'Rising aluminium prices detected - consider forward contracts',
        impact: 'medium',
        confidence: forecast.accuracy,
        suggestedAction: 'Negotiate forward contracts with suppliers',
        expectedOutcome: 'Lock in favorable prices and reduce cost volatility',
        costBenefit: {
          cost: 25000,
          benefit: 80000,
          roi: 220
        }
      });
    }
    
    return recommendations;
  }

  // Simplified forecasting algorithms
  private runLSTMModel(demandSeries: number[], config: ForecastingConfig) {
    const horizon = config.horizon;
    const trend = this.calculateTrend(demandSeries);
    const seasonalPattern = this.extractSeasonalPattern(demandSeries);
    
    const predictedDemand: number[] = [];
    const lower: number[] = [];
    const upper: number[] = [];
    
    for (let i = 0; i < horizon; i++) {
      const basePrediction = demandSeries[demandSeries.length - 1] * (1 + trend * (i + 1) / 30);
      const seasonalAdjustment = seasonalPattern[i % seasonalPattern.length] || 1;
      const prediction = basePrediction * seasonalAdjustment * (0.9 + Math.random() * 0.2);
      
      predictedDemand.push(Math.round(prediction));
      
      const confidence = 0.15;
      lower.push(Math.round(prediction * (1 - confidence)));
      upper.push(Math.round(prediction * (1 + confidence)));
    }

    return {
      predictedDemand,
      confidenceInterval: { lower, upper },
      modelMetrics: {
        mape: 5.2,
        rmse: 12.3,
        mae: 8.7,
        r2: 0.89
      }
    };
  }

  private runARIMAModel(demandSeries: number[], config: ForecastingConfig) {
    const horizon = config.horizon;
    
    const predictedDemand: number[] = [];
    const lower: number[] = [];
    const upper: number[] = [];
    
    for (let i = 0; i < horizon; i++) {
      const lastValue = demandSeries[demandSeries.length - 1];
      const trend = this.calculateTrend(demandSeries);
      const seasonal = this.extractSeasonalPattern(demandSeries)[i % 7] || 1;
      
      const prediction = lastValue * (1 + trend) * seasonal * (0.95 + Math.random() * 0.1);
      predictedDemand.push(Math.round(prediction));
      
      const confidence = 0.2;
      lower.push(Math.round(prediction * (1 - confidence)));
      upper.push(Math.round(prediction * (1 + confidence)));
    }

    return {
      predictedDemand,
      confidenceInterval: { lower, upper },
      modelMetrics: {
        mape: 7.8,
        rmse: 15.6,
        mae: 11.2,
        r2: 0.82
      }
    };
  }

  private runEnsembleModel(demandSeries: number[], config: ForecastingConfig) {
    const horizon = config.horizon;
    const weights = config.parameters.weights || [0.45, 0.35, 0.20];
    
    const lstmPred = this.runLSTMModel(demandSeries, config).predictedDemand;
    const arimaPred = this.runARIMAModel(demandSeries, config).predictedDemand;
    const prophetPred = this.runProphetModel(demandSeries, config).predictedDemand;
    
    const predictedDemand: number[] = [];
    const lower: number[] = [];
    const upper: number[] = [];
    
    for (let i = 0; i < horizon; i++) {
      const ensemblePred = 
        lstmPred[i] * weights[0] + 
        arimaPred[i] * weights[1] + 
        prophetPred[i] * weights[2];
      
      predictedDemand.push(Math.round(ensemblePred));
      
      const confidence = 0.12;
      lower.push(Math.round(ensemblePred * (1 - confidence)));
      upper.push(Math.round(ensemblePred * (1 + confidence)));
    }

    return {
      predictedDemand,
      confidenceInterval: { lower, upper },
      modelMetrics: {
        mape: 4.1,
        rmse: 9.8,
        mae: 6.5,
        r2: 0.92
      }
    };
  }

  private runProphetModel(demandSeries: number[], config: ForecastingConfig) {
    const horizon = config.horizon;
    
    const predictedDemand: number[] = [];
    const lower: number[] = [];
    const upper: number[] = [];
    
    for (let i = 0; i < horizon; i++) {
      const lastValue = demandSeries[demandSeries.length - 1];
      const trend = this.calculateTrend(demandSeries) * 0.8;
      const seasonal = this.extractSeasonalPattern(demandSeries)[i % 7] || 1;
      
      const prediction = lastValue * (1 + trend) * seasonal * (0.97 + Math.random() * 0.06);
      predictedDemand.push(Math.round(prediction));
      
      const confidence = 0.13;
      lower.push(Math.round(prediction * (1 - confidence)));
      upper.push(Math.round(prediction * (1 + confidence)));
    }

    return {
      predictedDemand,
      confidenceInterval: { lower, upper },
      modelMetrics: {
        mape: 6.3,
        rmse: 13.1,
        mae: 9.4,
        r2: 0.86
      }
    };
  }

  private runExponentialSmoothing(demandSeries: number[], config: ForecastingConfig) {
    const horizon = config.horizon;
    
    const predictedDemand: number[] = [];
    const lower: number[] = [];
    const upper: number[] = [];
    
    const alpha = 0.3;
    let smoothed = demandSeries[demandSeries.length - 1];
    
    for (let i = 0; i < horizon; i++) {
      const prediction = smoothed * (0.98 + Math.random() * 0.04);
      predictedDemand.push(Math.round(prediction));
      
      const confidence = 0.18;
      lower.push(Math.round(prediction * (1 - confidence)));
      upper.push(Math.round(prediction * (1 + confidence)));
      
      smoothed = alpha * prediction + (1 - alpha) * smoothed;
    }

    return {
      predictedDemand,
      confidenceInterval: { lower, upper },
      modelMetrics: {
        mape: 8.9,
        rmse: 16.7,
        mae: 12.8,
        r2: 0.79
      }
    };
  }

  private calculateTrend(series: number[]): number {
    const n = series.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = series;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope / (sumY / n);
  }

  private extractSeasonalPattern(series: number[]): number[] {
    const pattern: number[] = [];
    for (let i = 0; i < 7; i++) {
      const dayValues = [];
      for (let j = i; j < series.length; j += 7) {
        dayValues.push(series[j]);
      }
      pattern.push(dayValues.length > 0 ? dayValues.reduce((a, b) => a + b, 0) / dayValues.length : 1);
    }
    
    const avg = pattern.reduce((a, b) => a + b, 0) / pattern.length;
    return pattern.map(p => p / avg);
  }

  private findChangePoints(series: number[]): Date[] {
    const changePoints: Date[] = [];
    const threshold = 0.2;
    
    for (let i = 1; i < series.length; i++) {
      const change = Math.abs(series[i] - series[i-1]) / series[i-1];
      if (change > threshold) {
        const date = new Date();
        date.setDate(date.getDate() - (series.length - i));
        changePoints.push(date);
      }
    }
    
    return changePoints;
  }

  private calculateWeatherImpact(data: HistoricalData[]): number {
    return data.reduce((sum, d) => sum + (d.weather?.temperature || 0), 0) / data.length / 100;
  }

  private calculateHolidayImpact(data: HistoricalData[]): number {
    return data.filter(d => d.holidays && d.holidays.length > 0).length / data.length;
  }

  private calculateEventImpact(data: HistoricalData[]): number {
    return data.filter(d => d.events && d.events.length > 0).length / data.length;
  }

  private calculateEconomicImpact(data: HistoricalData[]): number {
    return data.reduce((sum, d) => sum + (d.economicIndicators?.gdp || 0), 0) / data.length / 100;
  }

  // Public API methods
  async getForecast(productId: string, plantId: string, configId?: string): Promise<Forecast> {
    const key = `${productId}-${plantId}-${configId || 'construction_ensemble'}`;
    const existingForecast = this.forecasts.get(key);
    
    if (existingForecast && 
        Date.now() - existingForecast.lastUpdated.getTime() < 24 * 60 * 60 * 1000) {
      return existingForecast;
    }
    
    return this.generateForecast(productId, plantId, configId);
  }

  async getForecastingConfigs(): Promise<ForecastingConfig[]> {
    return Array.from(this.configs.values());
  }

  async updateForecastingConfig(config: ForecastingConfig): Promise<void> {
    this.configs.set(config.id, config);
  }

  async getHistoricalData(productId: string, plantId: string): Promise<HistoricalData[]> {
    const key = `${productId}-${plantId}`;
    return this.historicalData.get(key) || [];
  }

  async getForecastComparison(productId: string, plantId: string): Promise<ForecastComparison[]> {
    const comparisons: ForecastComparison[] = [];
    const algorithms = ['lstm', 'arima', 'prophet', 'ensemble'];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      
      algorithms.forEach(algorithm => {
        const actual = 100 + Math.random() * 200;
        const predicted = actual * (0.8 + Math.random() * 0.4);
        const error = Math.abs(actual - predicted);
        
        comparisons.push({
          id: `comp_${Date.now()}_${i}_${algorithm}`,
          productId,
          plantId,
          date,
          actual: Math.round(actual),
          predicted: Math.round(predicted),
          algorithm,
          error: Math.round(error),
          percentageError: Math.round((error / actual) * 100)
        });
      });
    }
    
    return comparisons;
  }

  async getSeasonalAnalysis(productId: string, plantId: string): Promise<SeasonalAnalysis[]> {
    const seasons: ('spring' | 'summer' | 'fall' | 'winter')[] = ['spring', 'summer', 'fall', 'winter'];
    const currentYear = new Date().getFullYear();
    
    return seasons.map(season => ({
      id: `seasonal_${productId}_${plantId}_${season}_${currentYear}`,
      productId,
      plantId,
      season,
      year: currentYear,
      averageDemand: Math.round(120 + Math.random() * 80),
      peakDemand: Math.round(200 + Math.random() * 100),
      lowDemand: Math.round(50 + Math.random() * 50),
      seasonalityFactor: 0.8 + Math.random() * 0.4,
      trend: 0.05 + Math.random() * 0.1
    }));
  }

  async getTrendAnalysis(productId: string, plantId: string): Promise<TrendAnalysis[]> {
    const periods: ('short' | 'medium' | 'long')[] = ['short', 'medium', 'long'];
    
    return periods.map(period => ({
      id: `trend_${productId}_${plantId}_${period}`,
      productId,
      plantId,
      period,
      startDate: new Date(Date.now() - (period === 'short' ? 30 : period === 'medium' ? 90 : 365) * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      direction: Math.random() > 0.5 ? 'upward' : 'downward',
      slope: (Math.random() - 0.5) * 0.1,
      strength: 0.3 + Math.random() * 0.7,
      confidence: 70 + Math.random() * 25,
      changePoints: [new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)],
      seasonality: Math.random() > 0.3
    }));
  }
}

export const forecastingService = new ForecastingService(); 