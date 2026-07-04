import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from './UserContext'; // --- ADD THIS ---

// 1. Create the contexts
export const EventContext = createContext(null);

// 2. Create the provider
export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- ADD THIS ---
  // Get the user's loading status from UserContext
  const { loading: userLoading } = useContext(UserContext);
  // --- END ADD ---

  // 3. Create the function that fetches events
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");

    try {
      const response = await fetch("http://localhost:5000/api/events", {
        headers: {
          // Send token even for public routes, for consistency
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch events.");
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // Use useCallback

  // 4. Fetch events on initial load
  useEffect(() => {
    // --- UPDATED LOGIC ---
    // Wait for the user context to finish loading before fetching events.
    // This ensures we have the correct auth token.
    if (!userLoading) {
      fetchEvents();
    }
    // --- END UPDATE ---
  }, [userLoading, fetchEvents]); // Re-run if userLoading changes

  // 5. Provide the events and the "refetch" function to the whole app
  return (
    <EventContext.Provider value={{ events, isLoading, error, refetchEvents: fetchEvents }}>
      {children}
    </EventContext.Provider>
  );
};