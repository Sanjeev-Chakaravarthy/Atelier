import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignments = {
    left: 'left-0',
    right: 'right-0',
  };

  const currentAlign = alignments[align] || alignments.right;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute ${currentAlign} mt-2 w-56 rounded-md bg-surface-high border 
                       border-black/10 shadow-modal z-50 overflow-hidden ${className}`}
          >
            <div className="py-1" onClick={() => setIsOpen(false)}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  className = '',
  variant = 'default',
}) => {
  const variants = {
    default: 'text-on-surface-var hover:text-on-surface hover:bg-surface-highest',
    danger: 'text-error hover:bg-error/15',
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-body-sm transition-colors duration-150 
                 flex items-center gap-2 select-none ${currentVariant} ${className}`}
    >
      {children}
    </button>
  );
};

export default Dropdown;
