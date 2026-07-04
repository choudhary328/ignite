import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    // Check both storage locations (Remember Me → localStorage, otherwise → sessionStorage)
    const token = localStorage.getItem('igniteUserToken') || sessionStorage.getItem('igniteUserToken');
    if (token) {
      try {
        // This route MUST exist in your backend (it does now)
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          // Token is invalid or expired
          localStorage.removeItem('igniteUserToken');
          sessionStorage.removeItem('igniteUserToken');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        localStorage.removeItem('igniteUserToken');
        sessionStorage.removeItem('igniteUserToken');
        setCurrentUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, loading, refetchUser: fetchUser }}>
      {!loading && children}
    </UserContext.Provider>
  );
};