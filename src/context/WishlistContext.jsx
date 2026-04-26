import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import config from '../url/config';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { token, adminToken } = useAuth();
  const effectiveToken = token || adminToken;
  const [wishlist, setWishlist] = useState([]);

  // Fetch wishlist from server on mount/auth change
  useEffect(() => {
    const fetchWishlist = async () => {
      if (effectiveToken) {
        try {
          const response = await axios.get(`${config.API_BASE_URL}/wishlist`, {
            headers: {
              'Authorization': `Bearer ${effectiveToken}`
            }
          });
          if (response.status === 200) {
            setWishlist(Array.isArray(response.data) ? response.data : []);
          }
        } catch (error) {
          console.error("Error fetching wishlist:", error);
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    };

    fetchWishlist();
  }, [token]);

  const toggleWishlist = async (item) => {
    if (!token) {
      alert("Please login first to save items to your wishlist.");
      return;
    }

    try {
      const response = await axios.post(`${config.API_BASE_URL}/wishlist/toggle`, 
        { categoryId: item._id || item.id },
        {
          headers: {
            'Authorization': `Bearer ${effectiveToken}`
          }
        }
      );
      if (response.status === 200) {
        setWishlist(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const isInWishlist = (id) => {
    if (!id) return false;
    const searchId = id.toString();
    return (wishlist || []).some((item) => {
      const itemId = (item._id || item.id || item.cid || item.uid)?.toString();
      return itemId === searchId;
    });
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
