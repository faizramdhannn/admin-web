'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function useMasterItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/master-items');
      const data = await response.json();
      
      if (response.ok) {
        setItems(data.items || []);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData) => {
    try {
      const response = await fetch('/api/master-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Item created successfully');
        await fetchItems();
        return { success: true, item: data.item };
      } else {
        toast.error(data.error || 'Failed to create item');
        return { success: false, error: data.error };
      }
    } catch (err) {
      toast.error('Failed to create item');
      return { success: false, error: 'Failed to create item' };
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      const response = await fetch(`/api/master-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Item updated successfully');
        await fetchItems();
        return { success: true };
      } else {
        toast.error(data.error || 'Failed to update item');
        return { success: false, error: data.error };
      }
    } catch (err) {
      toast.error('Failed to update item');
      return { success: false, error: 'Failed to update item' };
    }
  };

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`/api/master-items/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Item deleted successfully');
        await fetchItems();
        return { success: true };
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete item');
        return { success: false, error: data.error };
      }
    } catch (err) {
      toast.error('Failed to delete item');
      return { success: false, error: 'Failed to delete item' };
    }
  };

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  };
}