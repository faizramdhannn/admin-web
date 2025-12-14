import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency (IDR)
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format number
export function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

// Format date
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('id-ID', { ...defaultOptions, ...options }).format(
    new Date(date)
  );
}

// Format date short
export function formatDateShort(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

// Parse date for input
export function parseDateForInput(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Calculate subtotal from items
export function calculateSubtotal(items) {
  return items.reduce((sum, item) => {
    return sum + (parseFloat(item.qty || 0) * parseFloat(item.value || 0));
  }, 0);
}

// Calculate PPN
export function calculatePPN(subtotal, percentage = 11) {
  return (subtotal * percentage) / 100;
}

// Calculate total
export function calculateTotal(subtotal, ppnAmount) {
  return subtotal + ppnAmount;
}

// Convert number to words (Indonesian)
export function numberToWords(num) {
  const ones = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
  const tens = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh'];
  const scales = ['', 'Ribu', 'Juta', 'Miliar', 'Triliun'];

  if (num === 0) return 'Nol';

  function convertLessThanThousand(n) {
    if (n === 0) return '';
    
    if (n < 10) return ones[n];
    if (n < 20) {
      if (n === 10) return 'Sepuluh';
      if (n === 11) return 'Sebelas';
      return ones[n - 10] + ' Belas';
    }
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
    }
    
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    const hundredWord = hundred === 1 ? 'Seratus' : ones[hundred] + ' Ratus';
    return hundredWord + (rest > 0 ? ' ' + convertLessThanThousand(rest) : '');
  }

  let result = '';
  let scaleIndex = 0;
  
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      let chunkWord = convertLessThanThousand(chunk);
      if (scaleIndex === 1 && chunk === 1) {
        chunkWord = 'Se';
      }
      result = chunkWord + (scaleIndex > 0 ? ' ' + scales[scaleIndex] : '') + (result ? ' ' + result : '');
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }
  
  return result.trim();
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Slugify string
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Truncate text
export function truncate(str, length = 50) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Validate email
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Generate random color
export function generateColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}