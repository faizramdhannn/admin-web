'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 12;

export default function MasterItemPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grouped');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (viewMode === 'grouped') {
      groupItemsByProduct();
    }
    // Reset to page 1 when search or view mode changes
    setCurrentPage(1);
  }, [items, searchTerm, viewMode]);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/master-items');
      const data = await response.json();
      
      if (response.ok) {
        setItems(data.items || []);
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

  const groupItemsByProduct = () => {
    let filteredItems = items;
    
    if (searchTerm) {
      filteredItems = items.filter(item =>
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_variant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.color_variant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.size_variant?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const grouped = {};
    filteredItems.forEach(item => {
      const productName = item.product_variant || 'Uncategorized';
      if (!grouped[productName]) {
        grouped[productName] = [];
      }
      grouped[productName].push(item);
    });

    setGroupedItems(grouped);
  };

  const toggleGroup = (productName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [productName]: !prev[productName]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    Object.keys(groupedItems).forEach(key => {
      allExpanded[key] = true;
    });
    setExpandedGroups(allExpanded);
  };

  const collapseAll = () => {
    setExpandedGroups({});
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

  const getFilteredFlatItems = () => {
    if (!searchTerm) return items;
    
    return items.filter(item =>
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_variant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color_variant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.size_variant?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Generate unique key for items
  const getUniqueKey = (item, index) => {
    return item.id || `item-${item.sku || ''}-${index}`;
  };

  // Pagination logic
  const getPaginatedData = () => {
    if (viewMode === 'grouped') {
      const groups = Object.entries(groupedItems);
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return groups.slice(startIndex, endIndex);
    } else {
      const flatItems = getFilteredFlatItems();
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return flatItems.slice(startIndex, endIndex);
    }
  };

  const getTotalPages = () => {
    if (viewMode === 'grouped') {
      return Math.ceil(Object.keys(groupedItems).length / ITEMS_PER_PAGE);
    } else {
      return Math.ceil(getFilteredFlatItems().length / ITEMS_PER_PAGE);
    }
  };

  const getTotalItems = () => {
    if (viewMode === 'grouped') {
      return Object.keys(groupedItems).length;
    } else {
      return getFilteredFlatItems().length;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = getTotalPages();
  const paginatedData = getPaginatedData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
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
            Manage your product inventory with variants
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
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <Input
                placeholder="Search by SKU, product, color, size, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5 text-gray-400" />}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grouped' ? 'flat' : 'grouped')}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                {viewMode === 'grouped' ? 'Flat View' : 'Group View'}
              </button>
              
              {viewMode === 'grouped' && (
                <>
                  <button
                    onClick={expandAll}
                    className="px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={collapseAll}
                    className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Collapse All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {viewMode === 'grouped' ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No items found. Click "Add Item" to create one.
                </p>
              </div>
            ) : (
              paginatedData.map(([productName, variants]) => (
                <div key={`group-${productName}`}>
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    onClick={() => toggleGroup(productName)}
                  >
                    <div className="flex items-center space-x-3">
                      {expandedGroups[productName] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      
                      {variants[0]?.image_url ? (
                        <img 
                          src={variants[0].image_url} 
                          alt={productName}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${variants[0]?.image_url ? 'hidden' : ''}`}>
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {productName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {variants.length} variant{variants.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="primary">{variants[0]?.category || 'No Category'}</Badge>
                  </div>

                  {expandedGroups[productName] && (
                    <div className="bg-gray-50 dark:bg-gray-750 p-4">
                      <div className="space-y-2">
                        {variants.map((item, index) => (
                          <div
                            key={getUniqueKey(item, index)}
                            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center space-x-4 flex-1">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.sku || 'Product image'}
                                  className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 ${item.image_url ? 'hidden' : ''}`}>
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                              
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">SKU</p>
                                  <p className="font-medium text-gray-900 dark:text-white">{item.sku || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Color</p>
                                  <p className="text-gray-900 dark:text-white">{item.color_variant || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Size</p>
                                  <p className="text-gray-900 dark:text-white">{item.size_variant || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Grade</p>
                                  {item.grade ? (
                                    <Badge variant="default">{item.grade}</Badge>
                                  ) : (
                                    '-'
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">HPP</p>
                                  <p className="text-gray-900 dark:text-white">
                                    {formatCurrency(parseFloat(item.hpp_unit) || 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">HPJ</p>
                                  <p className="font-semibold text-primary-600 dark:text-primary-400">
                                    {formatCurrency(parseFloat(item.hpj_unit) || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/master-item/edit/${item.id}`);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Color</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Grade</th>
                  <th className="px-6 py-3">HPP</th>
                  <th className="px-6 py-3">HPJ</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-500">
                      No items found. Click "Add Item" to create one.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr
                      key={getUniqueKey(item, index)}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <td className="px-6 py-4">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.sku || 'Product image'}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${item.image_url ? 'hidden' : ''}`}>
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{item.sku || '-'}</td>
                      <td className="px-6 py-4">{item.product_variant || '-'}</td>
                      <td className="px-6 py-4">{item.color_variant || '-'}</td>
                      <td className="px-6 py-4">{item.size_variant || '-'}</td>
                      <td className="px-6 py-4">
                        {item.category ? (
                          <Badge variant="default">{item.category}</Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.grade ? (
                          <Badge variant="primary">{item.grade}</Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4">{formatCurrency(parseFloat(item.hpp_unit) || 0)}</td>
                      <td className="px-6 py-4 font-semibold">
                        {formatCurrency(parseFloat(item.std_selling) || 0)}
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, getTotalItems())} of {getTotalItems()} {viewMode === 'grouped' ? 'groups' : 'items'}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}