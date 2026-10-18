
import { useState, useEffect } from "react";
import { fetchRestaurants } from "./services/restaurantservice";
import "./index.css";

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
const [formSuccess, setFormSuccess] = useState("");

const [favorites, setFavorites] = useState(() => {
  const savedFavorites = localStorage.getItem("foodiego-favorites");
  return savedFavorites ? JSON.parse(savedFavorites) : [];
});

const [selectedFood, setSelectedFood] = useState(null);
const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
const [sortByRating, setSortByRating] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const [maxPrice, setMaxPrice] = useState("All");
  

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    setError("");

    const data = await fetchRestaurants();
    setApiData(data);
  } catch (err) {
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

 
useEffect(() => {
  localStorage.setItem(
    "foodiego-favorites",
    JSON.stringify(favorites)
  );
}, [favorites]);




const filteredRestaurants = apiData.filter((restaurant) => {
  
  
    
  const matchesPrice =
  maxPrice === "All" ||
  Number(restaurant.price) <= Number(maxPrice);



console.log(
  "Food:", restaurant.name,
  "Price:", restaurant.price,
  "Selected:", maxPrice
);


  
  const matchesSearch = (restaurant.name || "")
    .toLowerCase()
    .includes(search.toLowerCase());


     const matchesFavorite =
    !showFavoritesOnly || favorites.includes(restaurant.id);

  const matchesCategory =
    category === "All" || restaurant.category === category;

 



  

  return (
    matchesSearch &&
    matchesCategory &&
    matchesFavorite &&
    matchesPrice

    
  );
});



  const sortedRestaurants = [...filteredRestaurants];

if (sortByRating) {
  sortedRestaurants.sort((a, b) => b.rating - a.rating);
}


  const itemsPerPage = 8;

  const totalPages = Math.ceil(
    sortedRestaurants.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentRestaurants = sortedRestaurants.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="app">

      {toastMessage && (
  <div className="toast-message">
    {toastMessage}
  </div>
)}
      <nav className="navbar">
        <h2 className="logo">🍽️ FoodieGo</h2>


        
<div className="favorites-count">
  ❤️ Favorites: {favorites.length}
</div>


        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#restaurants">Restaurants</a>
          <a href="#about">About</a>
        </div>
<button
  className="login-btn"
  onClick={() => {
    document.getElementById("login")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
  Login
</button>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="tagline">DELICIOUS FOOD, DELIVERED</p>

          <h1>
            Your favorite food,
            <br />
            delivered <span>fresh.</span>
          </h1>

          <p className="description">
            Discover delicious food and enjoy it at your home.
          </p>

          <a href="#restaurants" className="explore-btn">
            Explore Food →
          </a>
        </div>

        <div className="hero-image">🍔</div>
      </section>

      <section className="restaurants" id="restaurants">
        <p className="tagline">EXPLORE OUR MENU</p>

        <div className="search-filter">
          <input
            type="text"
            placeholder="Search food..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Categories</option>

            {[...new Set(
              apiData.map((restaurant) => restaurant.category)
            )].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>



          <select
  value={maxPrice}
  onChange={(e) => {
    setMaxPrice(e.target.value);
    setCurrentPage(1);
  }}
>
  <option value="All">All Prices</option>
  <option value="200">Under ₹200</option>
  <option value="300">Under ₹300</option>
  <option value="500">Under ₹500</option>
</select>
        </div>
                
<button
  className="favorite-btn"
  onClick={() => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setCurrentPage(1);
  }}
>
  {showFavoritesOnly ? "Show All Food" : "❤️ View Favorites"}
</button>

        <h2>Popular Food</h2>

        {loading && <p>Loading food items...</p>}
        {loading && <p>Please wait, loading menu...</p>}

    
{error && (
  <div>
    <p>Error: {error}</p>
    <button
      onClick={loadData}
      className="favorite-btn"
    >
      Try Again
    </button>
  </div>
)}

        {!loading && !error && filteredRestaurants.length === 0 && (
          <p>No food items found.</p>
        )}

        <div className="restaurant-grid">
          {currentRestaurants.map((restaurant) => (
           <div
             className="restaurant-card"
            key={restaurant.id}
            onClick={() => setSelectedFood(restaurant)}
>
              <img src={restaurant.image} alt={restaurant.name} />

              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.category}</p>


                <p className="restaurant-price">
  ₹{restaurant.price}
</p>

                <div className="restaurant-meta">
                  <span>⭐ {restaurant.rating}</span>
                  <span>{restaurant.time}</span>
                </div>

                <button
  className="favorite-btn"
onClick={() => {
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
  onClick={() => {
    setSortByRating(!sortByRating);
    setCurrentPage(1);
  }}
>
  {sortByRating ? "Default Order" : "⭐ Sort by Rating"}
</button>
              

              </div>
            </div>
          ))}
        </div>

            
{selectedFood && (
  <div className="food-modal">
    <div className="food-modal-content">
      <button
        className="modal-close"
        onClick={() => setSelectedFood(null)}
      >
        ✕
      </button>

      <img src={selectedFood.image} alt={selectedFood.name} />
      <h2>{selectedFood.name}</h2>
      <p>Category: {selectedFood.category}</p>
      <p>⭐ Rating: {selectedFood.rating}</p>
      <p>Cooking Time: {selectedFood.time}</p>
      <p>Price: ₹{selectedFood.price}</p>
    </div>
  </div>
)}





        {!loading && !error && totalPages > 0 && (
          <div className="pagination">
            <button
              onClick={() =>
                setCurrentPage((page) => Math.max(page - 1, 1))
              }
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(page + 1, totalPages)
                )
              }
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        )}



<div className="login-section" id="login">
  <div className="login-card">
    <h2>Welcome Back!</h2>
    <p>Login to your FoodieGo account</p>

   
<form
  onSubmit={(e) => {
    e.preventDefault();

    setFormError("");
    setFormSuccess("");

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    if (!email || !password) {
      setFormError("Please enter email and password.");
      return;
    }

    if (!e.target.email.checkValidity()) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setFormSuccess(
      "Form validation successful! Actual login will be added next."
    );

    e.target.reset();
    setShowPassword(false);
  }}
>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="Enter your email"
        required
      />

      <label htmlFor="password">Password</label>
     <div className="password-field">
  <input
    id="password"
    name="password"
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    required
  />

  <button
    type="button"
    className="show-password-btn"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>

      <button type="submit" className="login-submit">
        Login
      </button>
    </form>

    {formError && (
  <p className="form-error">{formError}</p>
)}

{formSuccess && (
  <p className="form-success">{formSuccess}</p>
)}

    <p className="signup-text">
      Don't have an account? <span>Sign up</span>
    </p>
  </div>
</div>

        
      </section>
    </div>
  );
}

export default App;
