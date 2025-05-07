
import { toast } from '@/components/ui/use-toast';

export interface PriceDataPoint {
  date: string;
  price: number;
}

export interface MarketCrop {
  crop: string;
  currentPrice: number;
  predictedPrice: number;
  changePercentage: number;
  priceHistory: PriceDataPoint[];
  factors: {
    weather: string;
    supply: string;
    demand: string;
  };
}

export interface MarketRecommendation {
  crop: string;
  description: string;
  changePercentage: number;
}

export interface MarketAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface MarketData {
  crops: MarketCrop[];
  marketTrend: string;
  trendPercentage: number;
  tradingVolume: string;
  volumeChange: number;
  forecastAccuracy: string;
  nextUpdate: string;
  sellingRecommendations: MarketRecommendation[];
  buyingRecommendations: MarketRecommendation[];
  alerts: MarketAlert[];
  lastUpdated: string;
}

/**
 * Fetch real-time market data from USDA Market News API
 * This is a simulated implementation that would be replaced with actual API calls
 */
export const fetchMarketData = async (): Promise<MarketData> => {
  try {
    // In a real implementation, this would make an actual API call to:
    // https://usda.library.cornell.edu/api/v1/catalog/.json?q=subject_sm:(%22agricultural%20statistics%22)
    // or similar endpoint

    // Simulating API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate semi-random but realistic market data
    const now = new Date();
    const getRandomPrice = (base: number) => +(base + (Math.random() * 0.5 - 0.25)).toFixed(2);
    const getRandomPercentage = (min: number, max: number) => +(min + Math.random() * (max - min)).toFixed(1);
    
    // Weather, supply and demand conditions - would come from API
    const weatherConditions = ['Favorable', 'Mixed', 'Concerning'];
    const supplyConditions = ['Decreasing', 'Stable', 'Increasing'];
    const demandConditions = ['Decreasing', 'Stable', 'Increasing'];
    
    const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    // Generate crop price history data
    const generatePriceHistory = (basePrice: number, days: number) => {
      return Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        
        // Create a realistic price progression with some random variation
        const variation = (Math.random() - 0.5) * 0.08; // +/- 4% daily variation
        const dayPrice = basePrice * (1 + variation);
        
        return {
          date: date.toISOString().split('T')[0],
          price: parseFloat(dayPrice.toFixed(2))
        };
      });
    };

    // Base crop data - in a real implementation, this would come from the API
    const cropData: MarketCrop[] = [
      {
        crop: 'Wheat',
        currentPrice: getRandomPrice(7.25),
        predictedPrice: 0, // Will calculate below
        changePercentage: getRandomPercentage(3, 9),
        priceHistory: generatePriceHistory(7.25, 30),
        factors: {
          weather: getRandomElement(weatherConditions),
          supply: getRandomElement(supplyConditions),
          demand: getRandomElement(demandConditions)
        }
      },
      {
        crop: 'Corn',
        currentPrice: getRandomPrice(4.95),
        predictedPrice: 0, // Will calculate below
        changePercentage: getRandomPercentage(3, 9),
        priceHistory: generatePriceHistory(4.95, 30),
        factors: {
          weather: getRandomElement(weatherConditions),
          supply: getRandomElement(supplyConditions),
          demand: getRandomElement(demandConditions)
        }
      },
      {
        crop: 'Soybeans',
        currentPrice: getRandomPrice(13.45),
        predictedPrice: 0, // Will calculate below
        changePercentage: getRandomPercentage(3, 9),
        priceHistory: generatePriceHistory(13.45, 30),
        factors: {
          weather: getRandomElement(weatherConditions),
          supply: getRandomElement(supplyConditions),
          demand: getRandomElement(demandConditions)
        }
      },
      {
        crop: 'Rice',
        currentPrice: getRandomPrice(14.15),
        predictedPrice: 0, // Will calculate below
        changePercentage: getRandomPercentage(3, 9),
        priceHistory: generatePriceHistory(14.15, 30),
        factors: {
          weather: getRandomElement(weatherConditions),
          supply: getRandomElement(supplyConditions),
          demand: getRandomElement(demandConditions)
        }
      },
      {
        crop: 'Barley',
        currentPrice: getRandomPrice(5.75),
        predictedPrice: 0, // Will calculate below
        changePercentage: getRandomPercentage(-4, 2),
        priceHistory: generatePriceHistory(5.75, 30),
        factors: {
          weather: getRandomElement(weatherConditions),
          supply: getRandomElement(supplyConditions),
          demand: getRandomElement(demandConditions)
        }
      },
      {
        crop: 'Oats',
        currentPrice: getRandomPrice(3.80),
        predictedPrice: 0, // Will calculate below
        changePercentage: getRandomPercentage(-4, 2),
        priceHistory: generatePriceHistory(3.80, 30),
        factors: {
          weather: getRandomElement(weatherConditions),
          supply: getRandomElement(supplyConditions),
          demand: getRandomElement(demandConditions)
        }
      }
    ];

    // Calculate predicted prices based on current price and change percentage
    cropData.forEach(crop => {
      crop.predictedPrice = parseFloat((crop.currentPrice * (1 + crop.changePercentage / 100)).toFixed(2));
    });

    // Generate market recommendations based on the crop data
    const sellingRecommendations = cropData
      .filter(crop => crop.changePercentage > 0)
      .sort((a, b) => b.changePercentage - a.changePercentage)
      .slice(0, 3)
      .map(crop => {
        let description = '';
        if (crop.factors.demand === 'Increasing') {
          description = 'Demand is increasing, prices expected to rise';
        } else if (crop.factors.supply === 'Decreasing') {
          description = 'Supply is decreasing, limited availability';
        } else {
          description = 'Favorable market conditions';
        }
        return {
          crop: crop.crop,
          description,
          changePercentage: crop.changePercentage
        };
      });

    const buyingRecommendations = cropData
      .filter(crop => crop.changePercentage < 3)
      .sort((a, b) => a.changePercentage - b.changePercentage)
      .slice(0, 3)
      .map(crop => {
        let description = '';
        if (crop.factors.supply === 'Increasing') {
          description = 'Oversupply in the market';
        } else if (crop.factors.demand === 'Decreasing') {
          description = 'Demand is softening';
        } else {
          description = 'Prices expected to drop';
        }
        return {
          crop: crop.crop,
          description,
          changePercentage: crop.changePercentage
        };
      });

    // Generate market alerts
    const marketAlerts: MarketAlert[] = [
      {
        id: '1',
        message: `Weather conditions in the Midwest may affect ${cropData[0].crop.toLowerCase()} prices in the next 2 weeks.`,
        severity: 'warning',
        timestamp: now.toISOString()
      },
      {
        id: '2',
        message: `${cropData[1].crop} prices expected to rise due to increasing international demand.`,
        severity: 'info',
        timestamp: now.toISOString()
      }
    ];

    // For some crops, randomly add critical alerts
    if (Math.random() > 0.5) {
      const randomCrop = cropData[Math.floor(Math.random() * cropData.length)].crop;
      marketAlerts.push({
        id: '3',
        message: `CRITICAL: Supply chain disruptions affecting ${randomCrop} distribution. Consider alternative sources.`,
        severity: 'critical',
        timestamp: now.toISOString()
      });
    }

    // Overall market trend
    const overallTrend = getRandomPercentage(-3, 8);

    const marketData: MarketData = {
      crops: cropData,
      marketTrend: overallTrend > 0 ? 'Bullish' : 'Bearish',
      trendPercentage: overallTrend,
      tradingVolume: `${(0.8 + Math.random() * 1.5).toFixed(1)}M`,
      volumeChange: getRandomPercentage(5, 15),
      forecastAccuracy: `${(90 + Math.random() * 8).toFixed(1)}%`,
      nextUpdate: `${Math.floor(Math.random() * 3)}h ${Math.floor(Math.random() * 59)}m`,
      sellingRecommendations,
      buyingRecommendations,
      alerts: marketAlerts,
      lastUpdated: now.toISOString()
    };

    return marketData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    toast({
      title: "Failed to fetch market data",
      description: "Could not connect to the market data service. Please try again later.",
      variant: "destructive"
    });
    throw error;
  }
};
