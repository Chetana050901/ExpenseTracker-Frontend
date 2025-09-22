import React from 'react';

const Dropdown = ({ 
  name, 
  value, 
  onChange, 
  options, 
  placeholder, 
  label, 
  required = false, 
  error = null 
}) => {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all bg-white ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
        required={required}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Dropdown;
