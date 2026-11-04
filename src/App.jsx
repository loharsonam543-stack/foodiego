import { useState, useEffect } from "react";
import { fetchRestaurants } from "./services/restaurantservice";
import FoodCard from "./components/FoodCard";
import "./index.css";

function App() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
const [isLoggingIn, setIsLoggingIn] = useState(false);
const [isRegistering, setIsRegistering] = useState(false);
const [myOrders, setMyOrders] = useState([]);
const [ordersMessage, setOrdersMessage] = useState("");
const [token, setToken] = useState(
  localStorage.getItem("foodiego-token") || ""
);



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

    useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 300);

  

  return () => clearTimeout(timer);
}, [search]);

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
    localStorage.setItem("foodiego-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const filteredRestaurants = apiData.filter((restaurant) => {
    const matchesPrice =
      maxPrice === "All" || Number(restaurant.price) <= Number(maxPrice);

    const matchesSearch = (restaurant.name || "")
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());

    const matchesFavorite =
      !showFavoritesOnly || favorites.includes(restaurant.id);

    const matchesCategory =
      category === "All" || restaurant.category === category;

    return matchesSearch && matchesCategory && matchesFavorite && matchesPrice;
  });

  const sortedRestaurants = [...filteredRestaurants];

  if (sortByRating) {
    sortedRestaurants.sort((a, b) => b.rating - a.rating);
  }

  const itemsPerPage = 8;

  const totalPages = Math.ceil(sortedRestaurants.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentRestaurants = sortedRestaurants.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const fetchMyOrders = async () => {
  setOrdersMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/my-orders",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

      setOrdersMessage(JSON.stringify(data));
      setMyOrders(data.orders || []);


    console.log("API response:", data);
console.log("Orders:", data.orders);
    console.log("Orders API response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch orders");
    }

    setMyOrders(data.orders || []);

  } catch (error) {
    setOrdersMessage(error.message);
  }
};



const placeOrder = async () => {
  if (!token) {
    setToastMessage("Please login first to place an order.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/place-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemName: selectedFood.name,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to place order");
    }

    setToastMessage("Order placed successfully! 🎉");
    setSelectedFood(null);
    await fetchMyOrders();
  } catch (error) {
    setToastMessage(error.message || "Unable to place order.");
  }
};



const handleLogout = () => {
  localStorage.removeItem("foodiego-token");

  setToken("");
  setMyOrders([]);
  setOrdersMessage("");
  setToastMessage("Logged out successfully!");
  setIsLoggingIn(false);
  setIsRegistering(false);
};







  return (
    <div className="app">
      {toastMessage && <div className="toast-message">{toastMessage}</div>}
      <nav className="navbar">
        <h2 className="logo">🍽️ FoodieGo</h2>

        <div className="favorites-count">❤️ Favorites: {favorites.length}</div>

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

            {[...new Set(apiData.map((restaurant) => restaurant.category))].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
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
            <button onClick={loadData} className="favorite-btn">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredRestaurants.length === 0 && (
          <p>No food items found.</p>
        )}
            
<div className="restaurant-grid">
  {currentRestaurants.map((restaurant) => (
    <FoodCard
      key={restaurant.id}
      restaurant={restaurant}
      favorites={favorites}
      setFavorites={setFavorites}
      setToastMessage={setToastMessage}
      setSelectedFood={setSelectedFood}
      sortByRating={sortByRating}
      setSortByRating={setSortByRating}
      setCurrentPage={setCurrentPage}
    />
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

              
                <button
                className="favorite-btn"
                onClick={placeOrder}
                >
                Place Order
                </button>




            </div>
          </div>
        )}

        {!loading && !error && totalPages > 0 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        )}

        <div className="login-section" id="login">
          <div className="login-card">
          <h2>{isRegistering ? "Create Account" : "Welcome Back!"}</h2>
          <p>
  {isRegistering
    ? "Register to your FoodieGo account"
    : "Login to your FoodieGo account"}
</p>

            <form
             onSubmit={async (e) => {
                e.preventDefault();

                setFormError("");
                setFormSuccess("");

                const email = e.target.email.value.trim();
                const password = e.target.password.value;


                const name = isRegistering ? e.target.name.value.trim() : "";

               if (!email || !password || (isRegistering && !name)) {
  setFormError("Please fill all required fields.");
  return;
}

if (isRegistering && password.length < 6) {
  setFormError("Password must be at least 6 characters.");
  return;
}

                if (!e.target.email.checkValidity()) {
                  setFormError("Please enter a valid email address.");
                  return;
                }

              

              setIsLoggingIn(true);

 try {
  const response = await fetch(
    isRegistering
      ? "http://localhost:5000/api/register"
      : "http://localhost:5000/api/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        isRegistering
          ? { name, email, password }
          : { email, password }
      ),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        (isRegistering ? "Registration failed" : "Login failed")
    );
  }

  if (isRegistering) {
    setFormSuccess("Registration successful! Please login.");
    setIsRegistering(false);
  } else {
    setToken(data.token);
    localStorage.setItem("foodiego-token", data.token);
    setFormSuccess("Login successful!");
  }

  e.target.reset();
  setShowPassword(false);
} catch (error) {
  setFormError(error.message || "Unable to connect to backend.");
} finally {
  setIsLoggingIn(false);
}             }}
            >

              {isRegistering && (
  <>
    <label htmlFor="name">Name</label>
    <input
      id="name"
      name="name"
      type="text"
      placeholder="Enter your name"
      required
    />
  </>
)}
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

             <button
  type="submit"
  className="login-submit"
  disabled={isLoggingIn}
>
  {isLoggingIn
    ? isRegistering
      ? "Registering..."
      : "Logging in..."
    : isRegistering
      ? "Register"
      : "Login"}
</button>
            </form>
           
{token && (
  <div className="my-orders-section">
    <button
      type="button"
      className="my-orders-btn"
      onClick={handleLogout}
    >
      Logout
    </button>

    <h2>My Orders</h2>
    <p className="orders-subtitle">
      Check your recent food orders
    </p>

    <button
      type="button"
      className="my-orders-btn"
      onClick={fetchMyOrders}
    >
      My Orders
    </button>

   
    <div className="orders-list">
      {myOrders.map((order) => (
        <div className="order-card" key={order.id}>
          <div className="order-card-header">
            <div>
             <h3>{order.item_name}</h3>
              <p className="order-id">
                Order ID: #{order.id}
              </p>
            </div>

            <span
              className={`order-status ${
                order.status?.toLowerCase() === "delivered"
                  ? "status-delivered"
                  : "status-preparing"
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="order-card-footer">
            <span>FoodieGo Order</span>
            <span>#{order.id}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}


            {formError && <p className="form-error">{formError}</p>}

            {formSuccess && <p className="form-success">{formSuccess}</p>}

           <p className="signup-text">
  {isRegistering
    ? "Already have an account? "
    : "Don't have an account? "}

  <span
    onClick={() => {
      setIsRegistering(!isRegistering);
      setFormError("");
      setFormSuccess("");
    }}
  >
    {isRegistering ? "Login" : "Sign up"}
  </span>
</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
