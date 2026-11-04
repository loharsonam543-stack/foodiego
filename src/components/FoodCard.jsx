
function FoodCard({
  restaurant,
  favorites,
  setFavorites,
  setToastMessage,
  setSelectedFood,
  sortByRating,
  setSortByRating,
  setCurrentPage,
}) {
  return (
    <div
      className="restaurant-card"
      onClick={() => setSelectedFood(restaurant)}
    >
      <img src={restaurant.image} alt={restaurant.name} />

      <div className="restaurant-info">
        <h3>{restaurant.name}</h3>
        <p>{restaurant.category}</p>

        <p className="restaurant-price">₹{restaurant.price}</p>

        <div className="restaurant-meta">
          <span>⭐ {restaurant.rating}</span>
          <span>{restaurant.time}</span>
        </div>

        <button
          className="favorite-btn"
          onClick={(e) => {
            e.stopPropagation();

            if (favorites.includes(restaurant.id)) {
              setFavorites(
                favorites.filter((id) => id !== restaurant.id)
              );
              setToastMessage("Removed from Favorites");
            } else {
              setFavorites([...favorites, restaurant.id]);
              setToastMessage("Added to Favorites ❤️");
            }

            setTimeout(() => {
              setToastMessage("");
            }, 2000);
          }}
        >
          {favorites.includes(restaurant.id)
            ? "❤️ Favorited"
            : "♡ Add to Favorites"}
        </button>

        <button
          className="favorite-btn"
          onClick={(e) => {
            e.stopPropagation();
            setSortByRating(!sortByRating);
            setCurrentPage(1);
          }}
        >
          {sortByRating ? "Default Order" : "⭐ Sort by Rating"}
        </button>
      </div>
    </div>
  );
}

export default FoodCard;
