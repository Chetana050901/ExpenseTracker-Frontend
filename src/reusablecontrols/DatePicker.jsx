import React from 'react';
import { Calendar } from 'lucide-react';

const DatePicker = ({ label, name, value, onChange, placeholder, error, required = false }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-400 bg-white'
          }`}
          required={required}
        />
        <Calendar size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};


export default DatePicker;
