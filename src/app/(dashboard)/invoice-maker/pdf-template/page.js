'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { 
  loadTemplateConfig, 
  saveTemplateConfig, 
  resetTemplateConfig,
  DEFAULT_TEMPLATE 
} from '@/lib/pdf-template';
import { previewInvoicePDF } from '@/lib/pdf-generator-new';
import toast from 'react-hot-toast';

export default function PDFTemplateCustomizerPage() {
  const router = useRouter();
  const [config, setConfig] = useState(DEFAULT_TEMPLATE);
  const [activeSection, setActiveSection] = useState('header');

  useEffect(() => {
    const loaded = loadTemplateConfig();
    setConfig(loaded);
  }, []);

  const handleSave = () => {
    saveTemplateConfig(config);
    toast.success('Template saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default template?')) {
      const defaultConfig = resetTemplateConfig();
      setConfig(defaultConfig);
      toast.success('Template reset to default');
    }
  };

  const handlePreview = async () => {
    // Create sample invoice for preview
    const sampleInvoice = {
      invoice_number: 'INV-202412-0001',
      so_number: '457638',
      date: new Date().toISOString(),
      purchase_date: new Date().toISOString(),
      customer_name: 'PLN Icon Plus Kantor Mampang',
      customer_address: 'Jl. Gatot Subroto No.50 51, RT.2/RW.2, West Kuningan, Mampang Prapatan, South Jakarta City, Jakarta 12710',
      items: [
        { name: 'Gatra Tas Ransel Kantor Torch 20L - Black', qty: 25, value: 485585.59 },
        { name: 'Gatra Tas Ransel Kantor Torch 20L - Navy', qty: 25, value: 485585.59 },
      ],
      subtotal: 24279279,
      ppn_amount: 2670721,
      total: 26950000,
      use_ppn: true,
      use_signature: true,
    };

    const sampleSettings = {
      company_name: 'MAHA NAGARI NUSANTARA',
      company_address: 'Jl. Lembong No. 30 Braga, Kec. Sumur Bandung - Bandung',
      company_phone: '0812-1432-445',
      bank_account: 'BCA 775-039-4447',
      account_holder: 'PT. Maha Nagari Nusantara',
    };

    try {
      previewInvoicePDF(sampleInvoice, sampleSettings, config);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to generate preview');
    }
  };

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: {
          ...prev[section][field],
          ...value,
        },
      },
    }));
  };

  const updateNestedConfig = (section, field, subfield, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: {
          ...prev[section][field],
          [subfield]: value,
        },
      },
    }));
  };

  const sections = [
    { id: 'header', label: 'Header' },
    { id: 'customer', label: 'Customer Info' },
    { id: 'purchaseDate', label: 'Purchase Date' },
    { id: 'itemsTable', label: 'Items Table' },
    { id: 'summary', label: 'Summary' },
    { id: 'footer', label: 'Footer' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
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
              PDF Template Customizer
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Customize the layout and appearance of your invoice PDFs
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handlePreview}
            icon={<Eye className="w-5 h-5" />}
          >
            Preview
          </Button>
          <Button
            variant="secondary"
            onClick={handleReset}
            icon={<RotateCcw className="w-5 h-5" />}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            icon={<Save className="w-5 h-5" />}
          >
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-l-4 border-primary-600'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <CardTitle>
                {sections.find(s => s.id === activeSection)?.label} Configuration
              </CardTitle>
              <CardDescription>
                Adjust position, size, and styling for this section
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Header Configuration */}
              {activeSection === 'header' && (
                <div className="space-y-6">
                  {/* Company Name */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Company Name</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.header.companyName.enabled}
                          onChange={(e) => updateNestedConfig('header', 'companyName', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                      <Input
                        label="X Position"
                        type="number"
                        value={config.header.companyName.x}
                        onChange={(e) => updateNestedConfig('header', 'companyName', 'x', Number(e.target.value))}
                      />
                      <Input
                        label="Y Position"
                        type="number"
                        value={config.header.companyName.y}
                        onChange={(e) => updateNestedConfig('header', 'companyName', 'y', Number(e.target.value))}
                      />
                      <Input
                        label="Font Size"
                        type="number"
                        value={config.header.companyName.fontSize}
                        onChange={(e) => updateNestedConfig('header', 'companyName', 'fontSize', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Invoice Label */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Invoice Label</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.header.invoiceLabel.enabled}
                          onChange={(e) => updateNestedConfig('header', 'invoiceLabel', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                      <Input
                        label="Y Position"
                        type="number"
                        value={config.header.invoiceLabel.y}
                        onChange={(e) => updateNestedConfig('header', 'invoiceLabel', 'y', Number(e.target.value))}
                      />
                      <Input
                        label="Font Size"
                        type="number"
                        value={config.header.invoiceLabel.fontSize}
                        onChange={(e) => updateNestedConfig('header', 'invoiceLabel', 'fontSize', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Company Address */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Company Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.header.companyAddress.enabled}
                          onChange={(e) => updateNestedConfig('header', 'companyAddress', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                      <Input
                        label="Y Position"
                        type="number"
                        value={config.header.companyAddress.y}
                        onChange={(e) => updateNestedConfig('header', 'companyAddress', 'y', Number(e.target.value))}
                      />
                      <Input
                        label="Font Size"
                        type="number"
                        value={config.header.companyAddress.fontSize}
                        onChange={(e) => updateNestedConfig('header', 'companyAddress', 'fontSize', Number(e.target.value))}
                      />
                      <Input
                        label="Max Width"
                        type="number"
                        value={config.header.companyAddress.maxWidth}
                        onChange={(e) => updateNestedConfig('header', 'companyAddress', 'maxWidth', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Configuration */}
              {activeSection === 'customer' && (
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Customer Label</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.customer.label.enabled}
                          onChange={(e) => updateNestedConfig('customer', 'label', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                      <Input
                        label="Y Position"
                        type="number"
                        value={config.customer.label.y}
                        onChange={(e) => updateNestedConfig('customer', 'label', 'y', Number(e.target.value))}
                      />
                      <Input
                        label="Font Size"
                        type="number"
                        value={config.customer.label.fontSize}
                        onChange={(e) => updateNestedConfig('customer', 'label', 'fontSize', Number(e.target.value))}
                      />
                      <Input
                        label="Label Text"
                        type="text"
                        value={config.customer.label.text}
                        onChange={(e) => updateNestedConfig('customer', 'label', 'text', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Customer Name</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.customer.name.enabled}
                          onChange={(e) => updateNestedConfig('customer', 'name', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                      <Input
                        label="Y Position"
                        type="number"
                        value={config.customer.name.y}
                        onChange={(e) => updateNestedConfig('customer', 'name', 'y', Number(e.target.value))}
                      />
                      <Input
                        label="Font Size"
                        type="number"
                        value={config.customer.name.fontSize}
                        onChange={(e) => updateNestedConfig('customer', 'name', 'fontSize', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Date Configuration */}
              {activeSection === 'purchaseDate' && (
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Purchase Date</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.purchaseDate.enabled}
                          onChange={(e) => updateConfig('purchaseDate', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                      <Input
                        label="Y Position"
                        type="number"
                        value={config.purchaseDate.y}
                        onChange={(e) => updateConfig('purchaseDate', 'y', Number(e.target.value))}
                      />
                      <Input
                        label="Font Size"
                        type="number"
                        value={config.purchaseDate.fontSize}
                        onChange={(e) => updateConfig('purchaseDate', 'fontSize', Number(e.target.value))}
                      />
                      <Input
                        label="Label"
                        type="text"
                        value={config.purchaseDate.label}
                        onChange={(e) => updateConfig('purchaseDate', 'label', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table Configuration */}
              {activeSection === 'itemsTable' && (
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Table Position</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Start Y Position"
                        type="number"
                        value={config.itemsTable.startY}
                        onChange={(e) => updateConfig('itemsTable', 'startY', Number(e.target.value))}
                      />
                      <Input
                        label="Header Font Size"
                        type="number"
                        value={config.itemsTable.headStyles.fontSize}
                        onChange={(e) => updateNestedConfig('itemsTable', 'headStyles', 'fontSize', Number(e.target.value))}
                      />
                      <Input
                        label="Body Font Size"
                        type="number"
                        value={config.itemsTable.bodyStyles.fontSize}
                        onChange={(e) => updateNestedConfig('itemsTable', 'bodyStyles', 'fontSize', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Configuration */}
              {activeSection === 'summary' && (
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Subtotal</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.summary.subtotal.enabled}
                          onChange={(e) => updateNestedConfig('summary', 'subtotal', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                      <Input
                        label="Font Size"
                        type="number"
                        value={config.summary.subtotal.fontSize}
                        onChange={(e) => updateNestedConfig('summary', 'subtotal', 'fontSize', Number(e.target.value))}
                      />
                      <Input
                        label="Label"
                        type="text"
                        value={config.summary.subtotal.label}
                        onChange={(e) => updateNestedConfig('summary', 'subtotal', 'label', e.target.value)}
                        className="col-span-2"
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Terbilang</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.summary.terbilang.enabled}
                          onChange={(e) => updateNestedConfig('summary', 'terbilang', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                      <Input
                        label="Font Size"
                        type="number"
                        value={config.summary.terbilang.fontSize}
                        onChange={(e) => updateNestedConfig('summary', 'terbilang', 'fontSize', Number(e.target.value))}
                      />
                      <Input
                        label="Prefix"
                        type="text"
                        value={config.summary.terbilang.prefix}
                        onChange={(e) => updateNestedConfig('summary', 'terbilang', 'prefix', e.target.value)}
                      />
                      <Input
                        label="Suffix"
                        type="text"
                        value={config.summary.terbilang.suffix}
                        onChange={(e) => updateNestedConfig('summary', 'terbilang', 'suffix', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Configuration */}
              {activeSection === 'footer' && (
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Bank Account</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.footer.bankAccount.enabled}
                          onChange={(e) => updateNestedConfig('footer', 'bankAccount', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                      <Input
                        label="Font Size"
                        type="number"
                        value={config.footer.bankAccount.fontSize}
                        onChange={(e) => updateNestedConfig('footer', 'bankAccount', 'fontSize', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Signature</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.footer.signature.enabled}
                          onChange={(e) => updateNestedConfig('footer', 'signature', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>
                      <Input
                        label="Font Size"
                        type="number"
                        value={config.footer.signature.fontSize}
                        onChange={(e) => updateNestedConfig('footer', 'signature', 'fontSize', Number(e.target.value))}
                      />
                      <Input
                        label="Offset X"
                        type="number"
                        value={config.footer.signature.offsetX}
                        onChange={(e) => updateNestedConfig('footer', 'signature', 'offsetX', Number(e.target.value))}
                      />
                      <Input
                        label="Space for Signature"
                        type="number"
                        value={config.footer.signature.spaceForSignature}
                        onChange={(e) => updateNestedConfig('footer', 'signature', 'spaceForSignature', Number(e.target.value))}
                      />
                      <Input
                        label="City"
                        type="text"
                        value={config.footer.signature.city}
                        onChange={(e) => updateNestedConfig('footer', 'signature', 'city', e.target.value)}
                      />
                      <Input
                        label="Signature Name"
                        type="text"
                        value={config.footer.signature.signatureName}
                        onChange={(e) => updateNestedConfig('footer', 'signature', 'signatureName', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}