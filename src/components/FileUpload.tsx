import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, AlertCircle } from "lucide-react"
import { toast } from "sonner"

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
        border-2 border-dashed rounded-md p-6 transition-colors duration-200 ease-in-out
        ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <Upload
          className={`mb-2 h-10 w-10 ${dragActive ? "text-primary" : "text-muted-foreground"}`}
        />
        <p className="mb-1 font-medium">
          {dragActive ? "Drop files here" : "Drag and drop files here"}
        </p>
        <p className="text-sm text-muted-foreground">
          or <span className="text-primary cursor-pointer">browse files</span>
        </p>
        <div className="mt-3 flex items-center text-xs text-muted-foreground">
          <AlertCircle className="mr-1 h-3 w-3" />
          <span>Supported formats: JPEG, PNG, GIF, PDF, TIFF, BMP, DICOM (Max: 10MB)</span>
        </div>
      </div>
    </div>
  )
}

export default FileUpload 