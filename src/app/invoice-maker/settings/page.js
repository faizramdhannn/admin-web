'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function InvoiceSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    invoice_prefix: 'INV',
    next_invoice_number: '1',
    ppn_percentage: '11',
    default_use_signature: false,
    default_use_ppn: true,
    header_image_url: '',
    signature_image_url: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (response.ok && data.settings) {
        setFormData({
          company_name: data.settings.company_name || '',
          company_address: data.settings.company_address || '',
          company_phone: data.settings.company_phone || '',
          company_email: data.settings.company_email || '',
          invoice_prefix: data.settings.invoice_prefix || 'INV',
          next_invoice_number: data.settings.next_invoice_number || '1',
          ppn_percentage: data.settings.ppn_percentage || '11',
          default_use_signature: data.settings.default_use_signature === 'true',
          default_use_ppn: data.settings.default_use_ppn === 'true',
          header_image_url: data.settings.header_image_url || '',
          signature_image_url: data.settings.signature_image_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            Invoice Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your invoice defaults and company information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              This information will appear on your invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="e.g., PT. Your Company"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Address
              </label>
              <textarea
                name="company_address"
                value={formData.company_address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter full company address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone"
                name="company_phone"
                value={formData.company_phone}
                onChange={handleChange}
                placeholder="e.g., 0812-3456-7890"
              />

              <Input
                label="Email"
                name="company_email"
                type="email"
                value={formData.company_email}
                onChange={handleChange}
                placeholder="e.g., info@company.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Defaults */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Defaults</CardTitle>
            <CardDescription>
              Default settings for new invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Invoice Prefix"
                name="invoice_prefix"
                value={formData.invoice_prefix}
                onChange={handleChange}
                placeholder="e.g., INV"
              />

              <Input
                label="Next Invoice Number"
                name="next_invoice_number"
                type="number"
                value={formData.next_invoice_number}
                onChange={handleChange}
                min="1"
              />

              <Input
                label="PPN Percentage"
                name="ppn_percentage"
                type="number"
                value={formData.ppn_percentage}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="11"
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="default_use_ppn"
                  checked={formData.default_use_ppn}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Use PPN by default
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    New invoices will have PPN enabled by default
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="default_use_signature"
                  checked={formData.default_use_signature}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Include signature by default
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    New invoices will include signature in PDF by default
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding (Optional)</CardTitle>
            <CardDescription>
              Add your logo and signature image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Header Image URL"
              name="header_image_url"
              value={formData.header_image_url}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              helperText="URL to your company logo (will appear in invoice header)"
            />

            <Input
              label="Signature Image URL"
              name="signature_image_url"
              value={formData.signature_image_url}
              onChange={handleChange}
              placeholder="https://example.com/signature.png"
              helperText="URL to signature image (will appear in invoice footer)"
            />
          </CardContent>
        </Card>

        {/* Actions */}
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
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}