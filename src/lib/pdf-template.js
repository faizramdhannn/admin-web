/**
 * PDF Template Configuration System
 * Allows customization of PDF invoice layout
 */

// Default template configuration
export const DEFAULT_TEMPLATE = {
  pageSize: 'a4',
  orientation: 'portrait',
  margins: {
    top: 15,
    right: 14,
    bottom: 15,
    left: 14,
  },
  
  // Header section
  header: {
    logo: {
      enabled: true,
      x: 14,
      y: 10,
      width: 30,
      height: 30,
      url: '',
    },
    companyName: {
      enabled: true,
      x: 14,
      y: 15,
      fontSize: 16,
      fontStyle: 'bold',
      color: [0, 0, 0],
    },
    companyAddress: {
      enabled: true,
      x: 14,
      y: 21,
      fontSize: 9,
      fontStyle: 'normal',
      color: [0, 0, 0],
      maxWidth: 120,
    },
    companyPhone: {
      enabled: true,
      x: 14,
      y: 26,
      fontSize: 9,
      fontStyle: 'normal',
      color: [0, 0, 0],
    },
    invoiceLabel: {
      enabled: true,
      x: 'right', // 'right' will be calculated as pageWidth - margin
      y: 15,
      fontSize: 18,
      fontStyle: 'italic',
      color: [0, 0, 0],
      align: 'right',
    },
    invoiceNumber: {
      enabled: true,
      x: 'right',
      y: 21,
      fontSize: 10,
      fontStyle: 'normal',
      color: [0, 0, 0],
      align: 'right',
      prefix: '#',
    },
    dividerLine: {
      enabled: true,
      y: 34,
      lineWidth: 0.3,
      color: [0, 0, 0],
    },
  },
  
  // Customer section
  customer: {
    label: {
      enabled: true,
      x: 14,
      y: 42,
      fontSize: 10,
      fontStyle: 'bold',
      text: 'Kepada Yth :',
    },
    name: {
      enabled: true,
      x: 14,
      y: 48,
      fontSize: 10,
      fontStyle: 'normal',
    },
    address: {
      enabled: true,
      x: 14,
      y: 53,
      fontSize: 9,
      fontStyle: 'normal',
      maxWidth: 90,
    },
  },
  
  // Purchase date section
  purchaseDate: {
    enabled: true,
    label: 'Tanggal Pembelian:',
    x: 'right',
    y: 42,
    fontSize: 9,
    fontStyle: 'normal',
    align: 'right',
  },
  
  // Items table
  itemsTable: {
    startY: 70,
    theme: 'grid',
    headStyles: {
      fillColor: [156, 194, 229],
      textColor: [0, 32, 96],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      qty: { halign: 'center', cellWidth: 20 },
      description: { halign: 'left', cellWidth: 85 },
      unitPrice: { halign: 'right', cellWidth: 40 },
      total: { halign: 'right', cellWidth: 40 },
    },
    columns: [
      { header: 'Qty', dataKey: 'qty' },
      { header: 'Deskripsi', dataKey: 'description' },
      { header: 'Harga Satuan', dataKey: 'unitPrice' },
      { header: 'Total', dataKey: 'total' },
    ],
  },
  
  // Summary section
  summary: {
    subtotal: {
      enabled: true,
      label: 'SubTotal',
      font: 'times',
      fontSize: 10,
      fontStyle: 'bold',
      align: 'left',
    },
    ppn: {
      enabled: true,
      label: 'PPN',
      fontSize: 10,
      font: 'times',
      fontStyle: 'bold',
      align: 'right',
    },
    total: {
      enabled: true,
      label: 'Total Pembayaran',
      fontSize: 11,
      font: 'times',
      fontStyle: 'bold',
      backgroundColor: [156, 194, 229],
      textColor: [0, 32, 96],
      align: 'right',
    },
    terbilang: {
      enabled: true,
      prefix: 'Terbilang: ',
      suffix: ' Rupiah',
      fontSize: 10,
      font: 'times',
      fontStyle: 'italic',
      offsetY: 8,
    },
  },
  
  // Footer section
  footer: {
    bankAccount: {
      enabled: true,
      x: 14,
      label: 'No Rek :',
      accountHolder: 'an. PT. Maha Nagari Nusantara',
      accountNumber: 'BCA 775-039-4447',
      fontSize: 10,
    },
    signature: {
      enabled: true,
      x: 'right',
      offsetX: -60, // offset from right
      city: 'Bandung',
      signatureName: 'Meida Kurniawati',
      spaceForSignature: 25,
      fontSize: 10,
      font: 'times',
    },
  },
};

/**
 * Save template configuration
 */
export function saveTemplateConfig(config) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pdf_template_config', JSON.stringify(config));
  }
  return config;
}

/**
 * Load template configuration
 */
export function loadTemplateConfig() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pdf_template_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse template config:', e);
      }
    }
  }
  return DEFAULT_TEMPLATE;
}

/**
 * Reset template to default
 */
export function resetTemplateConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pdf_template_config');
  }
  return DEFAULT_TEMPLATE;
}

/**
 * Merge custom config with default
 */
export function mergeTemplateConfig(customConfig) {
  return {
    ...DEFAULT_TEMPLATE,
    ...customConfig,
    header: {
      ...DEFAULT_TEMPLATE.header,
      ...(customConfig.header || {}),
    },
    customer: {
      ...DEFAULT_TEMPLATE.customer,
      ...(customConfig.customer || {}),
    },
    purchaseDate: {
      ...DEFAULT_TEMPLATE.purchaseDate,
      ...(customConfig.purchaseDate || {}),
    },
    itemsTable: {
      ...DEFAULT_TEMPLATE.itemsTable,
      ...(customConfig.itemsTable || {}),
    },
    summary: {
      ...DEFAULT_TEMPLATE.summary,
      ...(customConfig.summary || {}),
    },
    footer: {
      ...DEFAULT_TEMPLATE.footer,
      ...(customConfig.footer || {}),
    },
  };
}