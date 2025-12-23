import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate, numberToWords } from './utils';

export function generateInvoicePDF(invoice, settings = {}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Default settings - sesuai dengan format invoice Anda
  const companyName = settings.company_name || 'MAHA NAGARI NUSANTARA';
  const companyAddress = settings.company_address || 'Jl. Lembong No. 30 Braga, Kec. Sumur Bandung - Bandung';
  const companyPhone = settings.company_phone || '0812-1432-445';
  const bankAccount = 'BCA 775-039-4447';
  const accountHolder = 'PT. Maha Nagari Nusantara';
  
  // Logo placeholder (jika ada logo URL dari settings)
  let yPos = 15;
  
  // Header - Company Name dan Invoice
  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.text(companyName, 14, yPos);
  
  // Invoice di kanan atas
  doc.setFontSize(18);
  doc.setFont('times', 'italic');
  doc.text('Invoice', pageWidth - 14, yPos, { align: 'right' });
  
  // Company Address dan Phone
  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  doc.text(companyAddress, 14, yPos);
  
  // Invoice number di kanan
  doc.setFontSize(10);
  doc.text(`#${invoice.so_number}`, pageWidth - 14, yPos, { align: 'right' });
  
  yPos += 5;
  doc.setFontSize(9);
  doc.text(`Phone: ${companyPhone}`, 14, yPos);
  
  // Garis pemisah
  yPos += 8;
  doc.setLineWidth(0.3);
  doc.line(14, yPos, pageWidth - 14, yPos);
  
  // Customer Info
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.text('Kepada Yth :', 14, yPos);
  
  yPos += 6;
  doc.setFont('times', 'normal');
  doc.text(invoice.customer_name, 14, yPos);
  
  if (invoice.customer_address) {
    yPos += 5;
    const addressLines = doc.splitTextToSize(invoice.customer_address, 90);
    doc.text(addressLines, 14, yPos);
    yPos += (addressLines.length * 5);
  }
  
  // Table Items
  yPos += 10;
  
  // Hitung nilai untuk setiap item
  const tableData = invoice.items.map((item) => {
    const qty = parseFloat(item.qty || 0);
    const unitPrice = parseFloat(item.value || 0);
    const total = qty * unitPrice;
    
    return [
      qty,
      item.name,
      formatCurrency(unitPrice),
      formatCurrency(total)
    ];
  });
  
  // Buat table dengan autoTable - Use autoTable function directly
  autoTable(doc, {
    startY: yPos,
    head: [['Qty', 'Deskripsi', 'Harga Satuan', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [156, 194, 229],
      textColor: [0, 32, 96],
      fontStyle: 'bold',
      font: 'times',
      fontSize: 10,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 }, // Qty
      1: { halign: 'left', cellWidth: 85 },   // Deskripsi
      2: { halign: 'right', cellWidth: 40 },  // Harga Satuan
      3: { halign: 'right', cellWidth: 40 },  // Total
    },
    margin: { left: 14, right: 14 },
  });
  
  // Ambil posisi Y setelah table
  yPos = doc.lastAutoTable.finalY + 2;
  
  // Hitung nilai
  const subtotalValue = parseFloat(invoice.subtotal || 0);
  const ppnValue = parseFloat(invoice.ppn_amount || 0);
  const totalValue = parseFloat(invoice.total || 0);
  
  // Row untuk SubTotal
  autoTable(doc, {
    startY: yPos,
    body: [['SubTotal', formatCurrency(subtotalValue)]],
    theme: 'plain',
    styles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 145, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });
  
  yPos = doc.lastAutoTable.finalY;
  
  // Row untuk PPN jika digunakan
  if (invoice.use_ppn === 'true' || invoice.use_ppn === true) {
    autoTable(doc, {
      startY: yPos,
      body: [['PPN', formatCurrency(ppnValue)]],
      theme: 'plain',
      styles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 145, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });
    
    yPos = doc.lastAutoTable.finalY;
  }
  
  // Row untuk Total Pembayaran dengan background biru
  autoTable(doc, {
    startY: yPos,
    body: [['Total Pembayaran', formatCurrency(totalValue)]],
    theme: 'grid',
    headStyles: {
      fillColor: [156, 194, 229],
    },
    bodyStyles: {
      fillColor: [156, 194, 229],
      textColor: [0, 32, 96],
      fontSize: 11,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 145, halign: 'center' },
      1: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });
  
  yPos = doc.lastAutoTable.finalY + 8;
  
  // Terbilang
  doc.setFontSize(10);
  doc.setFont('times', 'italic');
  const terbilang = `Terbilang: ${numberToWords(Math.floor(totalValue))} Rupiah`;
  doc.text(terbilang, 14, yPos);
  
  // Info Rekening dan Tanggal/Tanda Tangan
  yPos += 15;
  
  // Kolom kiri - No Rek
  doc.setFont('times', 'bold');
  doc.text('No Rek :', 14, yPos);
  
  yPos += 6;
  doc.setFont('times', 'normal');
  doc.text(`an. ${accountHolder}`, 14, yPos);
  
  yPos += 5;
  doc.setFont('times', 'bold');
  doc.text(bankAccount, 14, yPos);
  
  // Kolom kanan - Tanggal dan Tanda Tangan
  if (invoice.use_signature === 'true' || invoice.use_signature === true) {
    const signatureX = pageWidth - 60;
    let signatureY = doc.lastAutoTable.finalY + 8;
    
    doc.setFont('times', 'normal');
    doc.text(`Bandung, ${formatDate(new Date(), { day: 'numeric', month: 'long', year: 'numeric' })}`, signatureX, signatureY);
    
    signatureY += 25; // Space untuk tanda tangan
    
    // Garis untuk tanda tangan
    doc.line(signatureX, signatureY, signatureX + 50, signatureY);
    
    signatureY += 5;
    doc.text('Meida Kurniawati', signatureX + 5, signatureY);
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