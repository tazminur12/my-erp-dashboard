'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal Component
 * @param {boolean} isOpen - Modal open/close state
 * @param {function} onClose - Function to close modal
 * @param {string} title - Modal title
 * @param {string} description - Modal description (optional)
 * @param {ReactNode} children - Modal content
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl', 'full' (default: 'md')
 * @param {boolean} showCloseButton - Show close button (default: true)
 * @param {string} overlayClassName - Custom overlay classes
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  overlayClassName = ''
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
      onClick={(e) => {
        // Close modal when clicking on overlay
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Translucent overlay - NOT black, allows page background to show */}
      <div 
        className="absolute inset-0 bg-white/60 dark:bg-gray-900/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        className={`
          relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl
          w-full ${sizeClasses[size]}
          max-h-[90vh] overflow-hidden
          flex flex-col
          transform transition-all duration-300
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {title && (
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
