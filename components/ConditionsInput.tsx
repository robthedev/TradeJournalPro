import React, { useState, useRef, useEffect } from 'react';
import { MOCK_CONDITIONS } from '../types';

interface ConditionsInputProps {
  value: Record<string, boolean>;
  onChange: (conditions: Record<string, boolean>) => void;
  onBlur?: () => void;
}

export const ConditionsInput: React.FC<ConditionsInputProps> = ({ value, onChange, onBlur }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  const activeConditions = Object.entries(value)
    .filter(([_, v]) => v)
    .map(([k]) => k);

  const toggleCondition = (tag: string) => {
    const newValue = { ...value };
    if (newValue[tag]) {
        delete newValue[tag];
    } else {
        newValue[tag] = true;
    }
    onChange(newValue);
    setInputValue('');
    // Keep open to allow selecting multiple
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (inputValue.trim()) {
            toggleCondition(inputValue.trim());
        }
    }
    if (e.key === 'Backspace' && inputValue === '') {
        // Optional: remove last tag logic if desired
    }
  };

  // Filter out conditions that are already selected
  const availableOptions = MOCK_CONDITIONS.filter(c => !value[c]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="flex flex-wrap gap-1 items-center min-h-[24px] w-full p-1 cursor-text bg-white/50 rounded border border-transparent hover:border-gray-200 focus-within:border-blue-300 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        {activeConditions.map(c => (
          <span 
              key={c} 
              onClick={(e) => { e.stopPropagation(); toggleCondition(c); }}
              className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] whitespace-nowrap cursor-pointer hover:bg-red-100 hover:text-red-800 transition-colors flex items-center gap-1"
          >
            {c} <span className="text-[8px] opacity-50">×</span>
          </span>
        ))}
        <input
          type="text"
          className="flex-1 min-w-[60px] text-[10px] bg-transparent outline-none placeholder-gray-400"
          placeholder={activeConditions.length === 0 ? "+ Condition" : ""}
          value={inputValue}
          onChange={e => { setInputValue(e.target.value); setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      
      {/* Dropdown for suggestions */}
      {isOpen && (
          <div className="absolute top-full left-0 z-50 w-full min-w-[150px] bg-white border border-gray-200 shadow-lg rounded mt-1 max-h-40 overflow-y-auto">
              <div className="py-1">
                {availableOptions.length > 0 ? (
                    availableOptions.map(c => (
                        <div 
                            key={c}
                            className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer text-gray-700 flex justify-between items-center"
                            onClick={() => toggleCondition(c)}
                        >
                            {c}
                            <span className="text-gray-300 text-[10px]">+</span>
                        </div>
                    ))
                ) : inputValue ? (
                     <div 
                        className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer text-blue-600 font-semibold"
                        onClick={() => toggleCondition(inputValue)}
                     >
                        Create "{inputValue}"
                     </div>
                ) : (
                    <div className="px-3 py-2 text-[10px] text-gray-400 italic">
                        All defaults selected. Type to add custom.
                    </div>
                )}
              </div>
          </div>
      )}
    </div>
  );
};
