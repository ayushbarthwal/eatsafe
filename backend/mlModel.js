// Simple ML-like Predictive Model for Food Spoilage
// Temperature (°C), Humidity (%)

function predictCFU(temp, humidity) {
  // Base CFU at perfect refrigeration
  let cfu = 80;

  // Temperature effect
  if (temp > 4) cfu += (temp - 4) * 100;
  if (temp > 10) cfu += (temp - 10) * 200;

  // Humidity effect
  if (humidity > 80) cfu += (humidity - 80) * 15;

  // Safety bound
  if (cfu < 50) cfu = 50;

  return Math.round(cfu);
}

function predictRisk(cfu) {
  if (cfu > 1000) return "High Risk";
  if (cfu > 600) return "Moderate Risk";
  return "Safe";
}

function makePrediction(temp, humidity) {
  const CFU = predictCFU(temp, humidity);
  const Risk = predictRisk(CFU);

  return { Temperature: temp, Humidity: humidity, CFU, Risk };
}

module.exports = { makePrediction };
