'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Download, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS } from '@/constants/config';
import toast from 'react-hot-toast';

export default function InvoiceMakerPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.so_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      
      if (response.ok) {
        setInvoices(data.invoices || []);
        setFilteredInvoices(data.invoices || []);
      } else {
        toast.error(data.error || 'Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Invoice deleted successfully');
        fetchInvoices();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const handleExport = async (id) => {
    try {
      toast.loading('Generating PDF...');
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
        toast.dismiss();
        toast.success('PDF downloaded successfully');
      } else {
        toast.dismiss();
        toast.error('Failed to export invoice');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.dismiss();
      toast.error('Failed to export invoice');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case INVOICE_STATUS.PAID:
        return 'success';
      case INVOICE_STATUS.SENT:
        return 'info';
      case INVOICE_STATUS.DRAFT:
      default:
        return 'default';
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
            Invoice Maker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage your invoices
          </p>
        </div>
        <Button
          onClick={() => router.push('/invoice-maker/create')}
          icon={<Plus className="w-5 h-5" />}
        >
          Create Invoice
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <Input
                placeholder="Search by invoice number, customer, or SO number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5 text-gray-400" />}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: INVOICE_STATUS.DRAFT, label: INVOICE_STATUS_LABELS.draft },
                  { value: INVOICE_STATUS.SENT, label: INVOICE_STATUS_LABELS.sent },
                  { value: INVOICE_STATUS.PAID, label: INVOICE_STATUS_LABELS.paid },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>SO Number</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No invoices found. Click "Create Invoice" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>{formatDateShort(invoice.date)}</TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell>{invoice.so_number || '-'}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(invoice.total || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/invoice-maker/edit/${invoice.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExport(invoice.id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Export PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
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
            Total: {filteredInvoices.length} invoices
            {(searchTerm || statusFilter !== 'all') && ` (filtered from ${invoices.length})`}
          </p>
        </div>
      </Card>
    </div>
  );
}