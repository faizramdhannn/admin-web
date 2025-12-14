'use client';

import { Search } from 'lucide-react';
import Input from './Input';

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className 
}) {
  return (
    <Input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      leftIcon={<Search className="w-5 h-5 text-gray-400" />}
      className={className}
    />
  );
}