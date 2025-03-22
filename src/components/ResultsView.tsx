import React, { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Copy, Download, FileText, RefreshCw } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface ResultsViewProps {
  results: string
  onNewScan: () => void
  modelName?: string
}

const ResultsView = ({ results, onNewScan, modelName }: ResultsViewProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(results)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([results], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `medical_analysis_${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg border-muted/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Analysis Results</CardTitle>
          </div>
          {modelName && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium flex items-center"
            >
              Analyzed with {modelName}
            </motion.div>
          )}
        </CardHeader>
        <CardContent className="pt-5 px-5">
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-muted/30 p-5 rounded-lg overflow-auto max-h-[60vh] shadow-inner">
            <ReactMarkdown>{results}</ReactMarkdown>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 p-5 bg-muted/10">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={onNewScan} 
              className="bg-primary text-white w-full sm:w-auto flex items-center gap-2"
              size="lg"
            >
              <RefreshCw size={16} className="mr-1" />
              New Analysis
            </Button>
          </motion.div>
          <div className="flex gap-3 w-full sm:w-auto">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-none"
            >
              <Button 
                variant="outline" 
                size="lg"
                className="w-full flex items-center justify-center gap-1 border-muted-foreground/20 hover:bg-muted/30"
                onClick={handleCopy}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <Check size={16} className="text-green-500" />
                      <span className="ml-1">Copied</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <Copy size={16} />
                      <span className="ml-1">Copy</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-none"
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full flex items-center justify-center gap-1 border-muted-foreground/20 hover:bg-muted/30"
                onClick={handleDownload}
              >
                <Download size={16} />
                <span className="ml-1">Download</span>
              </Button>
            </motion.div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default ResultsView 