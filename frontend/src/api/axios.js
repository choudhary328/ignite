import axios from "axios";

// 1. Create the base API instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 2. This is the most important part: The Interceptor
// This function automatically adds the Auth token to EVERY request
api.interceptors.request.use(
  (config) => {
    // Get the correct token from localStorage
    const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // --- THIS IS THE FIX ---
    // Your snippet used 'multipart/form-data', but ALL your
    // backend controllers expect 'application/json'.
    // This ensures all requests use the correct content type.
    if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    // --- END OF FIX ---

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Export reusable API functions (like the one you started)

/**
 * Updates the user's profile (name, email, password)
 * @param {object} formData - Should contain name, email, and optionally passwords
 */
export const updateUserProfile = async (formData) => {
  try {
    // --- THIS IS THE FIX ---
    // The correct path from your Userroutes.js is "/users/profile", not "/users/update"
    // We don't need to pass the token; the interceptor does it for us.
    const { data } = await api.put("/users/profile", formData);
    return data;
  } catch (error) {
    console.error("Error updating user:", error.response?.data || error.message);
    throw error;
  }
};

// 4. Export the configured instance as the default
export default api;