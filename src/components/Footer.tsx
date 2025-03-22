import React from "react";
import { motion } from "framer-motion";
import { ModelProvider } from "@/lib/types";
import { Sparkles } from "lucide-react";

interface FooterProps {
  modelProvider: ModelProvider;
}

const Footer: React.FC<FooterProps> = ({ modelProvider }) => {
  const modelName = modelProvider === ModelProvider.OpenAI ? "GPT-4o" : "Gemini 2.0 Flash";
  
  return (
    <motion.footer 
      className="mt-auto border-t py-4 md:py-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} MedScan. All rights reserved.
        </p>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <p className="text-center text-sm text-muted-foreground flex items-center gap-2">
            <span>Powered by</span> 
            <span className="bg-primary/10 rounded-full px-3 py-1 text-primary text-xs font-medium inline-flex items-center">
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