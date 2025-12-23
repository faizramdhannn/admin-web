import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate, numberToWords } from './utils';
import { loadTemplateConfig, DEFAULT_TEMPLATE } from './pdf-template';

/**
 * Generate Invoice PDF with customizable template
 */
export function generateInvoicePDF(invoice, settings = {}, templateConfig = null) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Load template configuration
  const template = templateConfig || loadTemplateConfig();
  
  // Helper function to calculate position
  const getX = (x) => {
    if (x === 'right') return pageWidth - template.margins.right;
    return x;
  };
  
  // Company information
  const companyName = settings.company_name || 'MAHA NAGARI NUSANTARA';
  const companyAddress = settings.company_address || 'Jl. Lembong No. 30 Braga, Kec. Sumur Bandung - Bandung';
  const companyPhone = settings.company_phone || '0812-1432-445';
  const bankAccount = settings.bank_account || 'BCA 775-039-4447';
  const accountHolder = settings.account_holder || 'PT. Maha Nagari Nusantara';
  
  // ===== HEADER SECTION =====
  let yPos = template.header.companyName.y;
  
  // Logo (if enabled and URL provided)
  if (template.header.logo.enabled && template.header.logo.url) {
    try {
      doc.addImage(
        template.header.logo.url,
        'PNG',
        template.header.logo.x,
        template.header.logo.y,
        template.header.logo.width,
        template.header.logo.height
      );
    } catch (e) {
      console.error('Failed to add logo:', e);
    }
  }
  
  // Company Name
  if (template.header.companyName.enabled) {
    doc.setFontSize(template.header.companyName.fontSize);
    doc.setFont('times', template.header.companyName.fontStyle);
    doc.setTextColor(...template.header.companyName.color);
    doc.text(companyName, template.header.companyName.x, template.header.companyName.y);
  }
  
  // Invoice Label (right side)
  if (template.header.invoiceLabel.enabled) {
    doc.setFontSize(template.header.invoiceLabel.fontSize);
    doc.setFont('times', template.header.invoiceLabel.fontStyle);
    doc.setTextColor(...template.header.invoiceLabel.color);
    doc.text('Invoice', getX(template.header.invoiceLabel.x), template.header.invoiceLabel.y, { 
      align: template.header.invoiceLabel.align 
    });
  }
  
  // Company Address
  if (template.header.companyAddress.enabled) {
    doc.setFontSize(template.header.companyAddress.fontSize);
    doc.setFont('times', template.header.companyAddress.fontStyle);
    doc.setTextColor(...template.header.companyAddress.color);
    const addressLines = doc.splitTextToSize(companyAddress, template.header.companyAddress.maxWidth);
    doc.text(addressLines, template.header.companyAddress.x, template.header.companyAddress.y);
  }
  
  // Invoice Number (right side)
  if (template.header.invoiceNumber.enabled) {
    doc.setFontSize(template.header.invoiceNumber.fontSize);
    doc.setFont('times', template.header.invoiceNumber.fontStyle);
    doc.setTextColor(...template.header.invoiceNumber.color);
    const invoiceNum = `${template.header.invoiceNumber.prefix}${invoice.so_number || invoice.invoice_number}`;
    doc.text(invoiceNum, getX(template.header.invoiceNumber.x), template.header.invoiceNumber.y, { 
      align: template.header.invoiceNumber.align 
    });
  }
  
  // Company Phone
  if (template.header.companyPhone.enabled) {
    doc.setFontSize(template.header.companyPhone.fontSize);
    doc.setFont('times', template.header.companyPhone.fontStyle);
    doc.setTextColor(...template.header.companyPhone.color);
    doc.text(`Phone: ${companyPhone}`, template.header.companyPhone.x, template.header.companyPhone.y);
  }
  
  // Header Divider Line
  if (template.header.dividerLine.enabled) {
    doc.setLineWidth(template.header.dividerLine.lineWidth);
    doc.setDrawColor(...template.header.dividerLine.color);
    doc.line(
      template.margins.left, 
      template.header.dividerLine.y, 
      pageWidth - template.margins.right, 
      template.header.dividerLine.y
    );
  }
  
  // ===== CUSTOMER SECTION =====
  yPos = template.customer.label.y;
  
  // Customer Label
  if (template.customer.label.enabled) {
    doc.setFontSize(template.customer.label.fontSize);
    doc.setFont('times', template.customer.label.fontStyle);
    doc.text(template.customer.label.text, template.customer.label.x, yPos);
  }
  
  // Customer Name
  if (template.customer.name.enabled) {
    yPos = template.customer.name.y;
    doc.setFontSize(template.customer.name.fontSize);
    doc.setFont('times', template.customer.name.fontStyle);
    doc.text(invoice.customer_name, template.customer.name.x, yPos);
  }
  
  // Customer Address
  if (template.customer.address.enabled && invoice.customer_address) {
    yPos = template.customer.address.y;
    doc.setFontSize(template.customer.address.fontSize);
    doc.setFont('times', template.customer.address.fontStyle);
    const addressLines = doc.splitTextToSize(invoice.customer_address, template.customer.address.maxWidth);
    doc.text(addressLines, template.customer.address.x, yPos);
  }
  
  // ===== PURCHASE DATE SECTION =====
  if (template.purchaseDate.enabled && invoice.purchase_date) {
    doc.setFontSize(template.purchaseDate.fontSize);
    doc.setFont('times', template.purchaseDate.fontStyle);
    const dateText = `${template.purchaseDate.label} ${formatDate(invoice.purchase_date, { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}`;
    doc.text(dateText, getX(template.purchaseDate.x), template.purchaseDate.y, { 
      align: template.purchaseDate.align 
    });
  }
  
  // ===== ITEMS TABLE =====
  yPos = template.itemsTable.startY;
  
  // Prepare table data with proper PPN calculation
  const usePPN = invoice.use_ppn === 'true' || invoice.use_ppn === true;
  const tableData = invoice.items.map((item) => {
    const qty = parseFloat(item.qty || 0);
    const priceWithPPN = parseFloat(item.value || 0); // This is the price including PPN
    
    // If PPN is enabled, the displayed unit price should be the price without PPN (DPP)
    const unitPrice = usePPN ? priceWithPPN / 1.11 : priceWithPPN;
    const totalWithPPN = qty * priceWithPPN;
    
    return {
      qty: qty,
      description: item.name,
      unitPrice: formatCurrency(unitPrice),
      total: formatCurrency(totalWithPPN)
    };
  });
  
  // Create items table
  autoTable(doc, {
    startY: yPos,
    head: [[
      template.itemsTable.columns[0].header,
      template.itemsTable.columns[1].header,
      template.itemsTable.columns[2].header,
      template.itemsTable.columns[3].header,
    ]],
    body: tableData.map(item => [item.qty, item.description, item.unitPrice, item.total]),
    theme: template.itemsTable.theme,
    headStyles: template.itemsTable.headStyles,
    bodyStyles: template.itemsTable.bodyStyles,
    columnStyles: template.itemsTable.columnStyles,
    margin: { left: template.margins.left, right: template.margins.right },
  });
  
  // Get position after table
  yPos = doc.lastAutoTable.finalY + 2;
  
  // Calculate values with proper PPN logic
  const totalWithPPN = invoice.items.reduce((sum, item) => 
    sum + (parseFloat(item.qty || 0) * parseFloat(item.value || 0)), 0
  );
  
  const subtotalDPP = usePPN ? totalWithPPN / 1.11 : totalWithPPN;
  const ppnValue = usePPN ? subtotalDPP * 0.11 : 0;
  const totalValue = subtotalDPP + ppnValue;
  
  // ===== SUMMARY SECTION =====
  
  // Subtotal (DPP)
  if (template.summary.subtotal.enabled) {
    autoTable(doc, {
      startY: yPos,
      body: [[template.summary.subtotal.label, formatCurrency(subtotalDPP)]],
      theme: 'plain',
      styles: {
        fontSize: template.summary.subtotal.fontSize,
      },
      columnStyles: {
        0: { 
          cellWidth: 145, 
          halign: template.summary.subtotal.align, 
          fontStyle: template.summary.subtotal.fontStyle 
        },
        1: { cellWidth: 40, halign: 'right' },
      },
      margin: { left: template.margins.left, right: template.margins.right },
    });
    yPos = doc.lastAutoTable.finalY;
  }
  
  // PPN
  if (template.summary.ppn.enabled && usePPN) {
    autoTable(doc, {
      startY: yPos,
      body: [[template.summary.ppn.label, formatCurrency(ppnValue)]],
      theme: 'plain',
      styles: {
        fontSize: template.summary.ppn.fontSize,
      },
      columnStyles: {
        0: { 
          cellWidth: 145, 
          halign: template.summary.ppn.align, 
          fontStyle: template.summary.ppn.fontStyle 
        },
        1: { cellWidth: 40, halign: 'right' },
      },
      margin: { left: template.margins.left, right: template.margins.right },
    });
    yPos = doc.lastAutoTable.finalY;
  }
  
  // Total Pembayaran
  if (template.summary.total.enabled) {
    autoTable(doc, {
      startY: yPos,
      body: [[template.summary.total.label, formatCurrency(totalValue)]],
      theme: 'grid',
      headStyles: {
        fillColor: template.summary.total.backgroundColor,
      },
      bodyStyles: {
        fillColor: template.summary.total.backgroundColor,
        textColor: template.summary.total.textColor,
        fontSize: template.summary.total.fontSize,
        fontStyle: template.summary.total.fontStyle,
      },
      columnStyles: {
        0: { cellWidth: 145, halign: template.summary.total.align },
        1: { cellWidth: 40, halign: 'right' },
      },
      margin: { left: template.margins.left, right: template.margins.right },
    });
    yPos = doc.lastAutoTable.finalY;
  }
  
  // Terbilang
  if (template.summary.terbilang.enabled) {
    yPos += template.summary.terbilang.offsetY;
    doc.setFontSize(template.summary.terbilang.fontSize);
    doc.setFont('times', template.summary.terbilang.fontStyle);
    const terbilang = `${template.summary.terbilang.prefix}${numberToWords(Math.floor(totalValue))}${template.summary.terbilang.suffix}`;
    doc.text(terbilang, template.margins.left, yPos);
  }
  
  // ===== FOOTER SECTION =====
  yPos += 15;
  
  // Bank Account Information
  if (template.footer.bankAccount.enabled) {
    doc.setFont('times', 'bold');
    doc.setFontSize(template.footer.bankAccount.fontSize);
    doc.text(template.footer.bankAccount.label, template.footer.bankAccount.x, yPos);
    
    yPos += 6;
    doc.setFont('times', 'normal');
    doc.text(template.footer.bankAccount.accountHolder, template.footer.bankAccount.x, yPos);
    
    yPos += 5;
    doc.setFont('times', 'bold');
    doc.text(bankAccount, template.footer.bankAccount.x, yPos);
  }
  
  // Signature Section
  if (template.footer.signature.enabled && (invoice.use_signature === 'true' || invoice.use_signature === true)) {
    const signatureX = template.footer.signature.x === 'right' 
      ? pageWidth + template.footer.signature.offsetX 
      : template.footer.signature.x;
    
    let signatureY = doc.lastAutoTable.finalY + 8;
    
    // Date and city
    const signatureDate = invoice.purchase_date || invoice.date || new Date();
    doc.setFont('times', 'normal');
    doc.setFontSize(template.footer.signature.fontSize);
    doc.text(
      `${template.footer.signature.city}, ${formatDate(signatureDate, { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}`, 
      signatureX, 
      signatureY
    );
    
    signatureY += template.footer.signature.spaceForSignature;
    
    // Signature line
    doc.line(signatureX, signatureY, signatureX + 50, signatureY);
    
    signatureY += 5;
    doc.text(template.footer.signature.signatureName, signatureX + 5, signatureY);
  }
  
  return doc;
}

/**
 * Download invoice as PDF
 */
export function downloadInvoicePDF(invoice, settings, templateConfig) {
  const doc = generateInvoicePDF(invoice, settings, templateConfig);
  doc.save(`Invoice-${invoice.so_number}.pdf`);
}

/**
 * Get invoice PDF as Blob
 */
export function getInvoicePDFBlob(invoice, settings, templateConfig) {
  const doc = generateInvoicePDF(invoice, settings, templateConfig);
  return doc.output('blob');
}

/**
 * Preview invoice PDF in new window
 */
export function previewInvoicePDF(invoice, settings, templateConfig) {
  const doc = generateInvoicePDF(invoice, settings, templateConfig);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}