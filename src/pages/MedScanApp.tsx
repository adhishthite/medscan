import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, FileText, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import FileUpload from "@/components/FileUpload"
import ResultsView from "@/components/ResultsView"
import Footer from "@/components/Footer"
import { analyzeWithModel, MODELS } from "@/lib/model-service"
import { ModelProvider } from "@/lib/types"
import { ModeToggle } from "@/components/mode-toggle"

// Define form schema
const formSchema = z.object({
  patientName: z.string()
    .min(3, "Patient name must be at least 3 characters")
    .max(100, "Patient name is too long")
    .refine(val => /^[a-zA-Z\s\-'.]+$/.test(val), {
      message: "Patient name should only contain letters, spaces, hyphens, apostrophes, and periods"
    }),
  patientAge: z.string()
    .refine(val => !isNaN(Number(val)), {
      message: "Age must be a number"
    })
    .refine(val => {
      const num = Number(val);
      return num >= 5 && num <= 90;
    }, {
      message: "Patient age must be between 5 and 90"
    }),
  additionalNotes: z.string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
  modelProvider: z.nativeEnum(ModelProvider),
})

type FormData = z.infer<typeof formSchema>

const MedScanApp = () => {
  const [files, setFiles] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<string | null>(null)
  const [modelProvider, setModelProvider] = useState<ModelProvider>(ModelProvider.Gemini)

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      patientAge: "",
      additionalNotes: "",
      modelProvider: ModelProvider.Gemini,
    },
  })

  const handleFileUpload = (acceptedFiles: File[]) => {
    // Limit to 5 files
    const totalFiles = [...files, ...acceptedFiles].slice(0, 5)
    setFiles(totalFiles)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (data: FormData) => {
    if (files.length === 0) {
      toast.error("Please upload at least one medical document")
      return
    }

    setIsAnalyzing(true)
    setModelProvider(data.modelProvider)
    
    try {
      // Call our model service with the selected provider
      const analysisResult = await analyzeWithModel(
        data.modelProvider,
        {
          patientName: data.patientName,
          patientAge: data.patientAge,
          additionalNotes: data.additionalNotes,
          files,
        }, 
        ""
      );
      
      setResults(analysisResult);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Error analyzing documents. Please try again.");
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetForm = () => {
    form.reset()
    setFiles([])
    setResults(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      <main className="flex-1 py-4">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="flex justify-between items-center mb-4">
            <motion.h1 
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              MedScan Analysis
            </motion.h1>
            <ModeToggle />
          </div>
          
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <ResultsView 
                  results={results} 
                  onNewScan={resetForm} 
                  modelName={MODELS.find(model => model.id === modelProvider)?.name}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-md overflow-hidden border-muted/50">
                  <CardHeader className="bg-muted/20 border-b border-border/50 py-3">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <div className="h-5 w-1 bg-primary rounded-full"></div>
                      Patient Information
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground/80">
                      Enter patient details and upload medical documents for analysis
                    </CardDescription>
                  </CardHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                      <CardContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="patientName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Patient Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter patient name" 
                                    className="shadow-sm" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="patientAge"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Patient Age</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter patient age" 
                                    className="shadow-sm"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="additionalNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter any additional information here" 
                                  className="min-h-[100px] shadow-sm resize-none"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div>
                          <FormLabel className="text-sm font-medium">Medical Documents</FormLabel>
                          <p className="text-xs text-muted-foreground mb-2">
                            Upload up to 5 medical documents (X-Rays, MRIs, CT Scans, etc.)
                          </p>
                          <FileUpload onFileUpload={handleFileUpload} />
                        </div>
                        
                        <AnimatePresence>
                          {files.length > 0 && (
                            <motion.div 
                              className="space-y-2"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <h4 className="text-sm font-medium flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                  {files.length}
                                </span>
                                <span>Uploaded Files ({files.length}/5)</span>
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {files.map((file, index) => (
                                  <motion.div 
                                    key={index} 
                                    className="flex items-center justify-between p-2 bg-muted/30 rounded-md border border-border/50"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className="p-1 bg-primary/10 rounded-md">
                                        <FileText size={12} className="text-primary" />
                                      </div>
                                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => removeFile(index)}
                                    >
                                      <X size={12} />
                                    </Button>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Hidden field for modelProvider */}
                        <input type="hidden" {...form.register("modelProvider")} value={ModelProvider.Gemini} />
                      </CardContent>
                      <CardFooter className="border-t border-border/50 bg-muted/10 py-4 px-4">
                        <motion.div 
                          className="w-full"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Button 
                            type="submit" 
                            disabled={isAnalyzing} 
                            className="w-full bg-primary text-white font-medium"
                            size="lg"
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              "Submit for Analysis"
                            )}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default MedScanApp 