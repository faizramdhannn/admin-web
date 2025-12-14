'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices');
      const data = await response.json();
      
      if (response.ok) {
        setInvoices(data.invoices || []);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Invoice created successfully');
        await fetchInvoices();
        return { success: true, invoice: data.invoice };
      } else {
        toast.error(data.error || 'Failed to create invoice');
        return { success: false, error: data.error };
      }
    } catch (err) {
      toast.error('Failed to create invoice');
      return { success: false, error: 'Failed to create invoice' };
    }
  };

  const updateInvoice = async (id, invoiceData) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Invoice updated successfully');
        await fetchInvoices();
        return { success: true };
      } else {
        toast.error(data.error || 'Failed to update invoice');
        return { success: false, error: data.error };
      }
    } catch (err) {
      toast.error('Failed to update invoice');
      return { success: false, error: 'Failed to update invoice' };
    }
  };

  const deleteInvoice = async (id) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Invoice deleted successfully');
        await fetchInvoices();
        return { success: true };
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete invoice');
        return { success: false, error: data.error };
      }
    } catch (err) {
      toast.error('Failed to delete invoice');
      return { success: false, error: 'Failed to delete invoice' };
    }
  };

  const exportInvoice = async (id) => {
    try {
      const response = await fetch(`/api/invoices/export/${id}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('PDF downloaded successfully');
        return { success: true };
      } else {
        toast.error('Failed to export invoice');
        return { success: false };
      }
    } catch (err) {
      toast.error('Failed to export invoice');
      return { success: false };
    }
  };

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    exportInvoice,
  };
}