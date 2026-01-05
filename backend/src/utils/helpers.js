// Helper functions

/**
 * Generate a unique tracking code
 */
export function generateTrackingCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TRK${timestamp}${random}`;
}

/**
 * Calculate fare based on weight, dimensions, and distance
 */
export function calculateFare(weight, length, width, height, distance) {
  // Base fare
  let fare = 50;

  // Weight-based pricing (₹10 per kg)
  fare += weight * 10;

  // Volume-based pricing (₹0.5 per cubic cm)
  const volume = length * width * height;
  fare += volume * 0.5;

  // Distance-based pricing (₹2 per km)
  if (distance) {
    fare += distance * 2;
  }

  // Minimum fare
  return Math.max(fare, 100);
}

/**
 * Parse dimensions string (e.g., "30x20x15") to length, width, height
 */
export function parseDimensions(dimensionsStr) {
  if (!dimensionsStr) return { length: 10, width: 10, height: 10 };
  
  const parts = dimensionsStr.toLowerCase().split(/[x×]/).map(s => parseFloat(s.trim()));
  if (parts.length === 3 && parts.every(p => !isNaN(p) && p > 0)) {
    return { length: parts[0], width: parts[1], height: parts[2] };
  }
  
  return { length: 10, width: 10, height: 10 };
}

/**
 * Sanitize input string
 */
export function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

