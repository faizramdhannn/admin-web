'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function CreateMasterItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    product_variant: '',
    color_variant: '',
    size_variant: '',
    article: '',
    category: '',
    grade: '',
    hpp_unit: '',
    std_selling: '',
    hpj_unit: '',
    image_url: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.product_variant) newErrors.product_variant = 'Product variant is required';
    
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

    try {
      const response = await fetch('/api/master-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Item created successfully');
        router.push('/master-item');
      } else {
        toast.error(data.error || 'Failed to create item');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create item');
    } finally {
      setLoading(false);
    }
  };

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
            Create Master Item
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add a new item to your inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Item Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g., SKU-001"
                required
                error={errors.sku}
              />

              <Input
                label="Product Variant"
                name="product_variant"
                value={formData.product_variant}
                onChange={handleChange}
                placeholder="e.g., T-Shirt Cotton"
                required
                error={errors.product_variant}
              />

              <Input
                label="Color Variant"
                name="color_variant"
                value={formData.color_variant}
                onChange={handleChange}
                placeholder="e.g., Blue"
              />

              <Input
                label="Size Variant"
                name="size_variant"
                value={formData.size_variant}
                onChange={handleChange}
                placeholder="e.g., L, XL"
              />

              <Input
                label="Article"
                name="article"
                value={formData.article}
                onChange={handleChange}
                placeholder="Article number"
              />

              <Input
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Clothing"
              />

              <Input
                label="Grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="e.g., Premium, Standard"
              />

              <Input
                label="Image URL"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pricing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="HPP Unit (Cost)"
                  name="hpp_unit"
                  type="number"
                  value={formData.hpp_unit}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />

                <Input
                  label="Standard Selling Price"
                  name="std_selling"
                  type="number"
                  value={formData.std_selling}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />

                <Input
                  label="HPJ Unit"
                  name="hpj_unit"
                  type="number"
                  value={formData.hpj_unit}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
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
                Create Item
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}