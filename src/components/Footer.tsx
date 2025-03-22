import React from "react";
import { motion } from "framer-motion";
import { ModelProvider } from "@/lib/types";

interface FooterProps {
  modelProvider: ModelProvider;
}

const Footer: React.FC<FooterProps> = ({ modelProvider }) => {
  const modelName = modelProvider === ModelProvider.OpenAI ? "GPT-4o" : "Gemini 2.0 Flash";
  
  return (
    <motion.footer 
      className="mt-auto border-t py-6 md:py-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} MedScan. All rights reserved.
        </p>
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <p className="text-center text-sm text-muted-foreground">
            Powered by {modelName}
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer; 