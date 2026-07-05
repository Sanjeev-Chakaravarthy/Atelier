import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const PageLayout = ({ title, children, className = '' }) => {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main viewport area */}
      <div className="flex-1 pl-sidebar flex flex-col min-w-0">
        <Navbar title={title} />

        {/* Content staging with Framer Motion slide transition */}
        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`flex-1 p-8 overflow-y-auto page-transition ${className}`}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default PageLayout;
