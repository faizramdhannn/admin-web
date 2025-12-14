'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, parseDateForInput } from '@/lib/utils';
import { MAX_INVOICE_ITEMS, INVOICE_STATUS } from '@/constants/config';
import toast from 'react-hot-toast';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [masterItems, setMasterItems] = useState([]);
  const [formData, setFormData] = useState({
    invoice_number: '',
    date: '',
    so_number: '',
    customer_name: '',
    customer_address: '',
    use_signature: false,
    use_ppn: true,
    status: INVOICE_STATUS.DRAFT,
  });
  const [items, setItems] = useState([
    { name: '', qty: 1, value: 0 }
  ]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (params.id) {
      fetchInvoice();
      fetchMasterItems();
    }
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        const invoice = data.invoice;
        setFormData({
          invoice_number: invoice.invoice_number,
          date: parseDateForInput(invoice.date),
          so_number: invoice.so_number || '',
          customer_name: invoice.customer_name,
          customer_address: invoice.customer_address || '',
          use_signature: invoice.use_signature === 'true',
          use_ppn: invoice.use_ppn === 'true',
          status: invoice.status,
        });
        
        if (invoice.items && invoice.items.length > 0) {
          setItems(invoice.items);
        }
      } else {
        toast.error(data.error || 'Failed to fetch invoice');
        router.push('/invoice-maker');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch invoice');
      router.push('/invoice-maker');
    } finally {
      setFetching(false);
    }
  };

  const fetchMasterItems = async () => {
    try {
      const response = await fetch('/api/master-items');
      const data = await response.json();
      if (response.ok) {
        setMasterItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'name' && value) {
      const selectedItem = masterItems.find(item => 
        `${item.product_variant} - ${item.sku}` === value
      );
      if (selectedItem) {
        newItems[index].value = parseFloat(selectedItem.std_selling || 0);
      }
    }

    setItems(newItems);
  };

  const addItem = () => {
    if (items.length < MAX_INVOICE_ITEMS) {
      setItems([...items, { name: '', qty: 1, value: 0 }]);
    } else {
      toast.error(`Maximum ${MAX_INVOICE_ITEMS} items per invoice`);
    }
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.value)), 0);
  };

  const calculatePPN = () => {
    return formData.use_ppn ? calculateSubtotal() * 0.11 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculatePPN();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.invoice_number) newErrors.invoice_number = 'Invoice number is required';
    if (!formData.customer_name) newErrors.customer_name = 'Customer name is required';
    if (!formData.date) newErrors.date = 'Date is required';
    
    const hasValidItem = items.some(item => item.name && item.qty > 0 && item.value > 0);
    if (!hasValidItem) {
      newErrors.items = 'At least one valid item is required';
      toast.error('Please add at least one item with valid quantity and price');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const validItems = items.filter(item => item.name && item.qty > 0);

    const invoiceData = {
      ...formData,
      items: validItems,
    };

    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Invoice updated successfully');
        router.push('/invoice-maker');
      } else {
        toast.error(data.error || 'Failed to update invoice');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update invoice');
    } finally {
      setLoading(false);
    }
  };

  const masterItemOptions = [
    { value: '', label: 'Select item or enter manually' },
    ...masterItems.map(item => ({
      value: `${item.product_variant} - ${item.sku}`,
      label: `${item.product_variant} - ${item.sku} (${formatCurrency(item.std_selling || 0)})`
    }))
  ];

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          icon={<ArrowLeft className="w-5 h-5" />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Invoice
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update invoice information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Invoice Number"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleChange}
                required
                error={errors.invoice_number}
              />
              <Input
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                error={errors.date}
              />
              <Input
                label="SO Number (Optional)"
                name="so_number"
                value={formData.so_number}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Customer Name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="Enter customer name"
              required
              error={errors.customer_name}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Address
              </label>
              <textarea
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter customer address"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button
                type="button"
                size="sm"
                onClick={addItem}
                icon={<Plus className="w-4 h-4" />}
                disabled={items.length >= MAX_INVOICE_ITEMS}
              >
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Item {index + 1}
                  </h4>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <Select
                      label="Item Name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      options={masterItemOptions}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Quantity"
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Input
                      label="Unit Price"
                      type="number"
                      value={item.value}
                      onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Subtotal: {' '}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(parseFloat(item.qty) * parseFloat(item.value))}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(calculateSubtotal())}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="use_ppn"
                    checked={formData.use_ppn}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    PPN 11%
                  </span>
                </label>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(calculatePPN())}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="use_signature"
                  checked={formData.use_signature}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Include signature in PDF
                </span>
              </label>
            </div>

            <div>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: INVOICE_STATUS.DRAFT, label: 'Draft' },
                  { value: INVOICE_STATUS.SENT, label: 'Sent' },
                  { value: INVOICE_STATUS.PAID, label: 'Paid' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            icon={<Save className="w-5 h-5" />}
          >
            Update Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}