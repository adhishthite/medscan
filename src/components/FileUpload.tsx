import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface FileUploadProps {
  onFileUpload: (files: File[]) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter(file => {
        // Filter for valid file types (images, PDFs, etc.)
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "application/pdf",
          "image/tiff",
          "image/bmp",
          "image/dicom",
        ]
        
        if (!validTypes.includes(file.type)) {
          toast.error(`Invalid file type: ${file.name}`)
          return false
        }
        
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File too large: ${file.name}`)
          return false
        }
        
        return true
      })
      
      if (validFiles.length > 0) {
        onFileUpload(validFiles)
        if (validFiles.length < acceptedFiles.length) {
          toast.info("Some files were skipped due to invalid format or size")
        }
      }
    },
    [onFileUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 5,
  })

  React.useEffect(() => {
    setDragActive(isDragActive)
  }, [isDragActive])

  return (
    <div
      {...getRootProps()}
      className={`
        relative overflow-hidden border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out group
        ${dragActive 
          ? "border-primary/80 bg-primary/5 shadow-md" 
          : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30"
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center p-6">
        <motion.div 
          className={`mb-3 p-3 rounded-full ${dragActive ? "bg-primary/10" : "bg-muted/50 group-hover:bg-primary/5"}`}
          animate={{ 
            scale: dragActive ? 1.1 : 1,
            y: dragActive ? -5 : 0
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Upload
            className={`h-8 w-8 transition-colors duration-300 ${dragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"}`}
          />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.p 
            key={dragActive ? "drop" : "drag"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-1 font-medium"
          >
            {dragActive ? "Drop files to upload" : "Drag and drop files here"}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm text-muted-foreground">
          or <span className="text-primary cursor-pointer underline-offset-2 hover:underline transition-all">browse files</span>
        </p>
        <div className="mt-4 flex items-center text-xs text-muted-foreground px-3 py-1.5 bg-muted/50 rounded-full">
          <AlertCircle className="mr-1.5 h-3 w-3 flex-shrink-0" />
          <span>Supported: JPEG, PNG, GIF, PDF, TIFF, BMP, DICOM (Max: 10MB)</span>
        </div>
      </div>
    </div>
  )
}

export default FileUpload 