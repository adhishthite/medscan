import React from "react";
import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";

const Header: React.FC = () => {
  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container flex h-16 items-center mx-auto px-4">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">MedScan</span>
        </motion.div>
        <div className="ml-auto flex items-center gap-4">
          <motion.div 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Advanced Medical Image Analysis
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 