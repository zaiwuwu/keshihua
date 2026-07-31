export function calcPricePerGram(marketPricePerTon) {
  return marketPricePerTon / 1000000;
}

export function calcMaterialCost(pricePerGram, weightGrams) {
  return parseFloat((pricePerGram * weightGrams).toFixed(6));
}

export function calcItemTotal(materialCost, factoryPrice, quantity) {
  return parseFloat(((materialCost + factoryPrice) * quantity).toFixed(2));
}

export function calcGrandTotal(items) {
  return parseFloat(items.reduce((sum, i) => sum + i.total, 0).toFixed(2));
}
