import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate, numberToWords } from './utils';

export async function generateInvoicePDF(invoice, settings = {}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Default settings
  const companyName = settings.company_name || 'MAHA NAGARI NUSANTARA';
  const companyAddress = settings.company_address || 'Jl. Lembong No. 30 Braga, Kec. Sumur Bandung - Bandung';
  const companyPhone = settings.company_phone || '0812-1432-445';
  const bankInfo = 'BCA 775-039-4447\na.n. PT. Maha Nagari Nusantara';
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Invoice', 14, 28);
  
  doc.setFontSize(9);
  doc.text(companyAddress, 14, 35);
  doc.text(`Phone: ${companyPhone}`, 14, 40);
  
  // Invoice number (right side)
  doc.setFontSize(10);
  doc.text(`#${invoice.invoice_number}`, pageWidth - 14, 20, { align: 'right' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(14, 45, pageWidth - 14, 45);
  
  // Customer info
  let yPos = 55;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Kepada Yth:', 14, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer_name, 14, yPos);
  
  if (invoice.customer_address) {
    yPos += 5;
    const addressLines = doc.splitTextToSize(invoice.customer_address, 80);
    doc.text(addressLines, 14, yPos);
    yPos += (addressLines.length * 5);
  }
  
  // Invoice details (right side)
  const detailsX = pageWidth - 80;
  let detailsY = 55;
  
  const details = [
    ['Invoice Date:', formatDate(invoice.date)],
    ['SO Number:', invoice.so_number || '-'],
  ];
  
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, detailsX, detailsY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, detailsX + 30, detailsY);
    detailsY += 6;
  });
  
  // Items table
  yPos = Math.max(yPos + 10, detailsY + 5);
  
  const tableData = invoice.items.map((item, index) => [
    index + 1,
    item.name,
    formatCurrency(item.value),
    item.qty,
    formatCurrency(item.qty * item.value),
  ]);
  
  doc.autoTable({
    startY: yPos,
    head: [['No', 'Deskripsi', 'Harga Satuan', 'Qty', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 35 },
    },
  });
  
  // Summary
  const finalY = doc.lastAutoTable.finalY + 10;
  const summaryX = pageWidth - 70;
  let summaryY = finalY;
  
  const subtotal = parseFloat(invoice.subtotal || 0);
  const ppnAmount = parseFloat(invoice.ppn_amount || 0);
  const total = parseFloat(invoice.total || 0);
  
  doc.setFontSize(10);
  
  // Subtotal
  doc.text('SubTotal', summaryX, summaryY);
  doc.text(formatCurrency(subtotal), pageWidth - 14, summaryY, { align: 'right' });
  summaryY += 7;
  
  // PPN
  if (invoice.use_ppn === 'true' || invoice.use_ppn === true) {
    doc.text('PPN', summaryX, summaryY);
    doc.text(formatCurrency(ppnAmount), pageWidth - 14, summaryY, { align: 'right' });
    summaryY += 7;
  }
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Pembayaran', summaryX, summaryY);
  doc.text(formatCurrency(total), pageWidth - 14, summaryY, { align: 'right' });
  
  // Terbilang
  summaryY += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  const terbilang = `Terbilang: ${numberToWords(Math.floor(total))} Rupiah`;
  doc.text(terbilang, 14, summaryY);
  
  // Bank info
  summaryY += 10;
  doc.setFont('helvetica', 'normal');
  doc.text('No Rek:', 14, summaryY);
  summaryY += 5;
  const bankLines = bankInfo.split('\n');
  bankLines.forEach(line => {
    doc.text(line, 14, summaryY);
    summaryY += 5;
  });
  
  // Signature
  if (invoice.use_signature === 'true' || invoice.use_signature === true) {
    const signatureY = pageHeight - 60;
    const signatureX = pageWidth - 70;
    
    doc.text(`Bandung, ${formatDate(new Date())}`, signatureX, signatureY);
    
    // Signature line
    doc.line(signatureX, signatureY + 20, signatureX + 50, signatureY + 20);
    doc.text('Meida Kurniawati', signatureX, signatureY + 25);
  }
  
  return doc;
}

export function downloadInvoicePDF(invoice, settings) {
  const doc = generateInvoicePDF(invoice, settings);
  doc.save(`Invoice-${invoice.invoice_number}.pdf`);
}

export function getInvoicePDFBlob(invoice, settings) {
  const doc = generateInvoicePDF(invoice, settings);
  return doc.output('blob');
}