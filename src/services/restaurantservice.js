
const API_URL = "https://dummyjson.com/recipes";

export const fetchRestaurants = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch food data");
  }

  const data = await response.json();

  return data.recipes.map((item) => ({

    
    id: item.id,
    name: item.name,
    category: item.cuisine,
    rating: item.rating,
    time: `${item.prepTimeMinutes + item.cookTimeMinutes} min`,
    image: item.image,
    price: Math.round((item.calories || 100) / 10) + 99,
  }));
};
