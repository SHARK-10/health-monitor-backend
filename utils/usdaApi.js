const axios = require("axios");

const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

/**
 * Search USDA food database.
 * @param {String} query - food name (e.g., "apple")
 * @param {Number} pageSize - number of results (default 10)
 * @returns {Array} simplified food list
 */
async function searchFoods(query, pageSize = 10) {
  try {
    const response = await axios.get(`${USDA_BASE_URL}/foods/search`, {
      params: {
        query,
        api_key: process.env.USDA_API_KEY,
        pageSize,
      },
    });

    const foods = (response.data.foods || []).map((food) => {
      // Extract key nutrients from the nutrients array
      const nutrients = food.foodNutrients || [];
      const findNutrient = (name) => {
        const n = nutrients.find((x) => x.nutrientName === name);
        return n ? Number(n.value) || 0 : 0;
      };

      return {
        fdcId: food.fdcId,
        name: food.description,
        dataType: food.dataType,
        brand: food.brandOwner || null,
        servingSize: food.servingSize || 100,
        servingUnit: food.servingSizeUnit || "g",
        calories: findNutrient("Energy"),
        protein: findNutrient("Protein"),
        carbs: findNutrient("Carbohydrate, by difference"),
        fat: findNutrient("Total lipid (fat)"),
      };
    });

    return foods;
  } catch (error) {
    console.error("USDA API Error:", error.message);
    throw new Error("Failed to fetch food data");
  }
}

module.exports = { searchFoods };
