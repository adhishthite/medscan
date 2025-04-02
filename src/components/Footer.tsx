import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const Footer: React.FC = () => {
  const modelName = "AI Medical Assistant";
  
  return (
    <motion.footer 
      className="mt-auto border-t py-2 md:py-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="container flex flex-col md:flex-row items-center justify-between gap-2 md:h-12">
        <p className="text-center text-xs text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} MedScan. All rights reserved.
        </p>
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <p className="text-center text-xs text-muted-foreground flex items-center gap-1.5">
            <span>Powered by</span> 
            <span className="bg-primary/10 rounded-full px-2 py-0.5 text-primary text-xs font-medium inline-flex items-center">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              {modelName}
            </span>
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer; 