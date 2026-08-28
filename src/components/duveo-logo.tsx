import React from "react";

interface DuveoLogoProps {
  className?: string;
}

export function DuveoLogo({ className = "w-6 h-6" }: DuveoLogoProps) {
  return (
    <svg 
      viewBox="0 0 44 32" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="3.6" 
      aria-hidden="true" 
      className={className}
    >
      <path d="M7 27 V5 H15 C23.5 5 27 10 27 16 C27 22 23.5 27 15 27 Z" stroke="currentColor"/>
      <path d="M26.8 12.8 L36.9 5.4" stroke="#C084FC"/>
      <polygon points="39.5,3.5 36.63,8.77 33.61,4.65" fill="#C084FC" stroke="#C084FC" strokeWidth="1.1"/>
    </svg>
  );
}
