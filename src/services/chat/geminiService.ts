import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with your API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('VITE_GEMINI_API_KEY is not set in environment variables');
}

// Initialize the API client
const genAI = new GoogleGenerativeAI(API_KEY || '');

// Fallback responses for when the API is not available
const FALLBACK_RESPONSES = {
  greeting: "Hello! I'm your farming assistant. How can I help you today?",
  product_info: "I can help you find information about our agricultural products. What would you like to know?",
  order_tracking: "To track your order, please provide your order ID or check your dashboard.",
  farming_advice: "I can provide general farming advice. What specific topic would you like to learn about?",
  marketplace: "Our marketplace offers a variety of agricultural products. You can browse by category or use the search feature.",
  error: "I apologize, but I'm having trouble connecting to my knowledge base. Please try again later or contact our support team.",
  default: "I understand you're interested in farming and agriculture. How can I assist you with your specific needs?"
};

// Simple keyword-based response system
const getFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return FALLBACK_RESPONSES.greeting;
  }
  if (lowerMessage.includes('product') || lowerMessage.includes('item')) {
    return FALLBACK_RESPONSES.product_info;
  }
  if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
    return FALLBACK_RESPONSES.order_tracking;
  }
  if (lowerMessage.includes('farm') || lowerMessage.includes('grow') || lowerMessage.includes('crop')) {
    return FALLBACK_RESPONSES.farming_advice;
  }
  if (lowerMessage.includes('market') || lowerMessage.includes('shop') || lowerMessage.includes('store')) {
    return FALLBACK_RESPONSES.marketplace;
  }
  
  return FALLBACK_RESPONSES.default;
};

// Enhanced fallback responses with more specific farming knowledge
const FARMING_KNOWLEDGE = {
  crops: {
    wheat: "Wheat is a staple crop that requires well-drained soil and moderate rainfall. Best planted in early spring or fall.",
    rice: "Rice grows best in flooded fields or paddies. It requires warm temperatures and plenty of water.",
    corn: "Corn needs rich soil and regular watering. Plant in spring after the last frost.",
    vegetables: "Most vegetables need well-draining soil, regular watering, and 6-8 hours of sunlight daily."
  },
  techniques: {
    organic: "Organic farming avoids synthetic inputs and focuses on natural methods like crop rotation and composting.",
    irrigation: "Proper irrigation is crucial. Consider drip irrigation for water efficiency.",
    pest_control: "Integrated pest management combines biological, cultural, and chemical methods for effective pest control."
  },
  marketplace: {
    selling: "To sell your products, create a detailed listing with clear photos and accurate descriptions.",
    buying: "When buying, check product ratings, reviews, and seller history for reliability.",
    pricing: "Research market prices and consider your production costs when setting prices."
  }
};

// Enhanced response system with farming knowledge
const getEnhancedResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Check for specific crop queries
  if (lowerMessage.includes('wheat')) {
    return FARMING_KNOWLEDGE.crops.wheat;
  }
  if (lowerMessage.includes('rice')) {
    return FARMING_KNOWLEDGE.crops.rice;
  }
  if (lowerMessage.includes('corn')) {
    return FARMING_KNOWLEDGE.crops.corn;
  }
  if (lowerMessage.includes('vegetable')) {
    return FARMING_KNOWLEDGE.crops.vegetables;
  }
  
  // Check for farming technique queries
  if (lowerMessage.includes('organic')) {
    return FARMING_KNOWLEDGE.techniques.organic;
  }
  if (lowerMessage.includes('irrigation') || lowerMessage.includes('water')) {
    return FARMING_KNOWLEDGE.techniques.irrigation;
  }
  if (lowerMessage.includes('pest') || lowerMessage.includes('insect')) {
    return FARMING_KNOWLEDGE.techniques.pest_control;
  }
  
  // Check for marketplace queries
  if (lowerMessage.includes('sell') || lowerMessage.includes('listing')) {
    return FARMING_KNOWLEDGE.marketplace.selling;
  }
  if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
    return FARMING_KNOWLEDGE.marketplace.buying;
  }
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return FARMING_KNOWLEDGE.marketplace.pricing;
  }
  
  // If no specific match, use the basic fallback
  return getFallbackResponse(message);
};

export const getGeminiResponse = async (userMessage: string): Promise<string> => {
  if (!API_KEY) {
    return FALLBACK_RESPONSES.error;
  }

  try {
    // Log the API key (first few characters) for debugging
    console.log('Using API key starting with:', API_KEY.substring(0, 5) + '...');

    // Try to get response from API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a helpful farming assistant for an agricultural marketplace. 
    Respond to the following user message in a friendly and concise way, focusing on farming and marketplace topics:
    "${userMessage}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error getting response from API:', error);
    
    // Use enhanced fallback response system
    return getEnhancedResponse(userMessage);
  }
}; 