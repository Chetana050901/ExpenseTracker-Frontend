import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({ 
  label, 
  name,  
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error = null,
  min,   
  step,   
  ...rest 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="mb-3"> 
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          name={name}  
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          step={step}
          className={`w-full px-2 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          }`}
          required={required}
          {...rest}  
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputField;