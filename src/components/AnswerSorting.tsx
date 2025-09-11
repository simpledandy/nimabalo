"use client";

import { useState } from 'react';

type SortOption = 'newest' | 'oldest' | 'longest' | 'shortest';

interface AnswerSortingProps {
  onSortChange: (sortBy: SortOption) => void;
  currentSort: SortOption;
}

export default function AnswerSorting({ onSortChange, currentSort }: AnswerSortingProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'newest', label: 'Eng yangi', icon: '🆕' },
    { value: 'oldest', label: 'Eng eski', icon: '📅' },
    { value: 'longest', label: 'Eng uzun', icon: '📝' },
    { value: 'shortest', label: 'Eng qisqa', icon: '✂️' },
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-light text-primary rounded-lg font-medium hover:bg-accent hover:text-white transition-all duration-300 hover:scale-105"
      >
        <span className="animate-bounce-slow">🔀</span>
        <span>Saralash</span>
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48 animate-fade-in-up">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSortChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-light transition-colors flex items-center gap-2 ${
                currentSort === option.value ? 'bg-accent text-white font-medium' : 'text-primary'
              }`}
            >
              <span className="text-lg">{option.icon}</span>
              <span>{option.label}</span>
              {currentSort === option.value && (
                <span className="ml-auto text-white">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
