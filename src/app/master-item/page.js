'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MasterItemPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(item =>
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_variant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items]);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/master-items');
      const data = await response.json();
      
      if (response.ok) {
        setItems(data.items || []);
        setFilteredItems(data.items || []);
      } else {
        toast.error(data.error || 'Failed to fetch items');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/master-items/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Item deleted successfully');
        fetchItems();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Master Items
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your product inventory
          </p>
        </div>
        <Button
          onClick={() => router.push('/master-item/create')}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Item
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by SKU, product, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5 text-gray-400" />}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>HPP</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No items found. Click "Add Item" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.product_variant}</TableCell>
                    <TableCell>{item.color_variant || '-'}</TableCell>
                    <TableCell>{item.size_variant || '-'}</TableCell>
                    <TableCell>
                      {item.category ? (
                        <Badge variant="default">{item.category}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {item.grade ? (
                        <Badge variant="primary">{item.grade}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{formatCurrency(item.hpp_unit || 0)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(item.std_selling || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/master-item/edit/${item.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: {filteredItems.length} items
            {searchTerm && ` (filtered from ${items.length})`}
          </p>
        </div>
      </Card>
    </div>
  );
}