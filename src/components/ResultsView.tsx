import React, { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Check, Copy, Download } from "lucide-react"
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
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Analysis Results</CardTitle>
          {modelName && (
            <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
              Analyzed with {modelName}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert bg-muted p-4 rounded-md overflow-auto max-h-[60vh]">
            <ReactMarkdown>{results}</ReactMarkdown>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={onNewScan} className="bg-primary text-white">
            New Scan
          </Button>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy</span>
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={handleDownload}
            >
              <Download size={16} />
              <span>Download</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default ResultsView 