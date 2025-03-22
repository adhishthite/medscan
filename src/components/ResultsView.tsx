import React from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"
import { FileDown, RefreshCw } from "lucide-react"

interface ResultsViewProps {
  results: string
  onNewScan: () => void
}

const ResultsView: React.FC<ResultsViewProps> = ({ results, onNewScan }) => {
  return (
    <Card className="w-full shadow-lg">
      <CardContent className="pt-6">
        <motion.div 
          className="prose max-w-none dark:prose-invert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ReactMarkdown>{results}</ReactMarkdown>
        </motion.div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="outline" onClick={() => window.print()}>
            <FileDown className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={onNewScan}>
            <RefreshCw className="mr-2 h-4 w-4" />
            New Scan
          </Button>
        </motion.div>
      </CardFooter>
    </Card>
  )
}

export default ResultsView 